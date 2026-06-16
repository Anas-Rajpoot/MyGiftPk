/* Server-managed cart — server-only.
 *
 * The WooCommerce Store API on this instance does NOT persist a guest cart
 * between requests (the Cart-Token references a session that isn't saved), so we
 * keep the cart ourselves in an httpOnly cookie holding only product references
 * (id, variation, qty, coupon codes). Every read re-prices the items FROM THE
 * LIVE WOOCOMMERCE CATALOG via the REST API, so totals are always server-trusted
 * and never depend on client-supplied prices. Checkout creates the order from
 * the same references (see app/api/checkout/route.ts). */

import { cookies } from 'next/headers'
import type { NextResponse } from 'next/server'
import type { CartData, CartLineItem } from '@/lib/cart/normalize'

const WP_BASE = (process.env.WP_GRAPHQL_URL ?? '').replace(/\/graphql\/?$/, '')
const WC_KEY = process.env.WC_CONSUMER_KEY ?? ''
const WC_SECRET = process.env.WC_CONSUMER_SECRET ?? ''
const REST_BASE = `${WP_BASE}/wp-json/wc/v3`

export const CART_COOKIE = 'mygift-cart'
const FREE_SHIPPING_THRESHOLD = 3000
const GIFT_WRAP_COST = 'Rs. 150'

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 30,
  path: '/',
}

export interface CartItemRef {
  productId: number
  variationId: number | null
  quantity: number
}

export interface CartState {
  items: CartItemRef[]
  coupons: string[]
}

function authHeader() {
  return 'Basic ' + Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64')
}

export function itemKey(productId: number, variationId: number | null): string {
  return `${productId}-${variationId ?? 0}`
}

function fmt(n: number): string {
  return 'Rs. ' + Math.round(n).toLocaleString('en-PK')
}

/* ── Cookie read/write ──────────────────────────── */

export async function readCartState(): Promise<CartState> {
  const store = await cookies()
  const raw = store.get(CART_COOKIE)?.value
  if (!raw) return { items: [], coupons: [] }
  try {
    const parsed = JSON.parse(raw) as Partial<CartState>
    return {
      items: Array.isArray(parsed.items) ? parsed.items.filter((i) => Number.isInteger(i.productId)) : [],
      coupons: Array.isArray(parsed.coupons) ? parsed.coupons.filter((c) => typeof c === 'string') : [],
    }
  } catch {
    return { items: [], coupons: [] }
  }
}

export function writeCartState(res: NextResponse, state: CartState): void {
  res.cookies.set(CART_COOKIE, JSON.stringify(state), COOKIE_OPTS)
}

export function clearCartCookie(res: NextResponse): void {
  res.cookies.set(CART_COOKIE, '', { ...COOKIE_OPTS, maxAge: 0 })
}

/* ── Pricing from the live catalog ──────────────── */

interface WcProduct {
  id: number
  name: string
  slug: string
  price: string
  stock_status: string
  images: { src: string; alt: string }[]
  attributes?: { name: string; option?: string }[]
}

async function fetchProducts(ids: number[]): Promise<Map<number, WcProduct>> {
  const map = new Map<number, WcProduct>()
  const unique = [...new Set(ids)]
  // Fetch each product by ID — the REST `include` filter is unreliable on this
  // instance (returns the default list), so per-ID lookups are used instead.
  await Promise.all(
    unique.map(async (id) => {
      const res = await fetch(`${REST_BASE}/products/${id}`, {
        headers: { Authorization: authHeader() },
        cache: 'no-store',
      })
      if (res.ok) {
        const p = (await res.json()) as WcProduct
        if (p?.id) map.set(p.id, p)
      }
    })
  )
  return map
}

interface WcVariation {
  id: number
  price: string
  stock_status: string
  image?: { src: string; alt: string }
  attributes?: { name: string; option?: string }[]
}

async function fetchVariation(productId: number, variationId: number): Promise<WcVariation | null> {
  const res = await fetch(`${REST_BASE}/products/${productId}/variations/${variationId}`, {
    headers: { Authorization: authHeader() },
    cache: 'no-store',
  })
  if (!res.ok) return null
  return (await res.json()) as WcVariation
}

interface WcCoupon {
  code: string
  discount_type: string
  amount: string
}

async function fetchCoupon(code: string): Promise<WcCoupon | null> {
  const url = new URL(`${REST_BASE}/coupons`)
  url.searchParams.set('code', code)
  const res = await fetch(url.toString(), { headers: { Authorization: authHeader() }, cache: 'no-store' })
  if (!res.ok) return null
  const list = (await res.json()) as WcCoupon[]
  return list[0] ?? null
}

/** Validate a coupon exists; returns true if applicable. */
export async function couponExists(code: string): Promise<boolean> {
  return (await fetchCoupon(code)) !== null
}

/* ── Build full CartData from state (re-prices everything) ── */

export async function buildCartData(state: CartState): Promise<CartData> {
  if (state.items.length === 0) {
    return emptyCart()
  }

  const products = await fetchProducts(state.items.map((i) => i.productId))

  const items: CartLineItem[] = []
  let subtotal = 0
  for (const ref of state.items) {
    const p = products.get(ref.productId)
    if (!p) continue // product no longer exists — drop it

    let unit = parseFloat(p.price) || 0
    let image = p.images?.[0] ? { sourceUrl: p.images[0].src, altText: p.images[0].alt ?? '' } : null
    let variationLabel = ''

    if (ref.variationId) {
      const v = await fetchVariation(ref.productId, ref.variationId)
      if (v) {
        unit = parseFloat(v.price) || unit
        if (v.image?.src) image = { sourceUrl: v.image.src, altText: v.image.alt ?? '' }
        variationLabel = (v.attributes ?? []).map((a) => a.option).filter(Boolean).join(' / ')
      }
    }

    const lineTotalNum = unit * ref.quantity
    subtotal += lineTotalNum

    items.push({
      key: itemKey(ref.productId, ref.variationId),
      productId: ref.productId,
      variationId: ref.variationId,
      slug: p.slug,
      name: p.name,
      image,
      variationLabel,
      quantity: ref.quantity,
      unitPrice: fmt(unit),
      lineTotal: fmt(lineTotalNum),
    })
  }

  // Coupons — priced from the live coupon definitions
  const discounts: { code: string; amount: string }[] = []
  let discountTotal = 0
  for (const code of state.coupons) {
    const c = await fetchCoupon(code)
    if (!c) continue
    const amt = parseFloat(c.amount) || 0
    let d = 0
    if (c.discount_type === 'percent') d = (subtotal * amt) / 100
    else d = amt // fixed_cart / fixed_product (approx)
    d = Math.min(d, subtotal - discountTotal)
    if (d > 0) {
      discounts.push({ code: c.code, amount: fmt(d) })
      discountTotal += d
    }
  }

  const total = Math.max(0, subtotal - discountTotal)

  return {
    items,
    subtotal: fmt(subtotal),
    total: fmt(total),
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    discounts,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    freeShippingRemaining: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
    giftWrapEnabled: false,
    giftWrapCost: GIFT_WRAP_COST,
  }
}

export function emptyCart(): CartData {
  return {
    items: [],
    subtotal: fmt(0),
    total: fmt(0),
    itemCount: 0,
    discounts: [],
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    freeShippingRemaining: FREE_SHIPPING_THRESHOLD,
    giftWrapEnabled: false,
    giftWrapCost: GIFT_WRAP_COST,
  }
}

/* ── Mutations on state (pure) ──────────────────── */

export function addItem(state: CartState, ref: CartItemRef): CartState {
  const existing = state.items.find(
    (i) => i.productId === ref.productId && (i.variationId ?? null) === (ref.variationId ?? null)
  )
  if (existing) {
    existing.quantity = Math.min(99, existing.quantity + ref.quantity)
  } else {
    state.items.push({ ...ref, quantity: Math.min(99, Math.max(1, ref.quantity)) })
  }
  return state
}

export function setQty(state: CartState, key: string, quantity: number): CartState {
  state.items = state.items
    .map((i) => (itemKey(i.productId, i.variationId) === key ? { ...i, quantity } : i))
    .filter((i) => i.quantity > 0)
  return state
}

export function removeItemByKey(state: CartState, key: string): CartState {
  state.items = state.items.filter((i) => itemKey(i.productId, i.variationId) !== key)
  return state
}
