/**
 * WooCommerce Blocks Store API cart client — server-only.
 * Replaces WooGraphQL cart mutations when WooGraphQL is not installed.
 * Session managed via Cart-Token JWT in an httpOnly cookie.
 */

import type { CartData, CartLineItem } from '@/lib/cart/normalize'

const WP_BASE = (process.env.WP_GRAPHQL_URL ?? '').replace(/\/graphql\/?$/, '')
const STORE_BASE = `${WP_BASE}/wp-json/wc/store/v1`

/* ── Store API shapes ─────────────────────────────── */

interface StorePrice {
  price: string
  regular_price: string
  sale_price: string
  currency_prefix: string
  currency_minor_unit: number
}

interface StoreTotals {
  line_subtotal: string
  line_total: string
}

interface StoreCartTotals {
  total_items: string
  total_discount: string
  total_price: string
  currency_prefix: string
  currency_minor_unit: number
}

interface StoreCartCoupon {
  code: string
  totals: { total_discount: string }
}

interface StoreCartItem {
  key: string
  id: number
  name: string
  quantity: number
  sku: string
  permalink: string
  images: { src: string; alt: string }[]
  prices: StorePrice
  totals: StoreTotals
  variation: { attribute: string; value: string }[]
}

interface StoreCart {
  items: StoreCartItem[]
  totals: StoreCartTotals
  coupons: StoreCartCoupon[]
}

/* ── HTTP helpers ─────────────────────────────────── */

async function storeRequest<T>(
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  body?: unknown,
  token?: string | null
): Promise<{ data: T; newToken: string | null }> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers['Cart-Token'] = token

  const res = await fetch(`${STORE_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })

  const newToken = res.headers.get('Cart-Token') ?? null

  if (!res.ok) {
    let msg = `Store API ${res.status}: ${path}`
    try {
      const err = await res.json() as { message?: string }
      if (err.message) msg = err.message
    } catch { /* ignore */ }
    throw new Error(msg)
  }

  const data = await res.json() as T
  return { data, newToken }
}

/* ── Normalization ────────────────────────────────── */

// Prices from Store API are integers with currency_minor_unit decimal places
// e.g. "11200" with minor_unit=0 → Rs. 11,200
function fmtStorePrice(raw: string, minorUnit: number): string {
  const num = parseInt(raw, 10) / Math.pow(10, minorUnit)
  return 'Rs. ' + Math.round(num).toLocaleString('en-PK')
}

function slugFromPermalink(permalink: string): string {
  return permalink.replace(/\/$/, '').split('/').pop() ?? ''
}

function buildVariationLabel(attrs: StoreCartItem['variation']): string {
  return attrs.map((a) => a.value).filter(Boolean).join(' / ')
}

export function normalizeStoreCart(
  cart: StoreCart,
  opts: { freeShippingThreshold: number; giftWrapCost: string; giftWrapEnabled?: boolean }
): CartData {
  const minorUnit = cart.totals?.currency_minor_unit ?? 0

  const items: CartLineItem[] = cart.items.map((item) => ({
    key: item.key,
    productId: item.id,
    variationId: null,
    slug: slugFromPermalink(item.permalink),
    name: item.name,
    image: item.images?.[0]
      ? { sourceUrl: item.images[0].src, altText: item.images[0].alt ?? '' }
      : null,
    variationLabel: buildVariationLabel(item.variation ?? []),
    quantity: item.quantity,
    unitPrice: fmtStorePrice(item.prices.price, item.prices.currency_minor_unit ?? 0),
    lineTotal: fmtStorePrice(item.totals.line_total, minorUnit),
  }))

  const subtotalNum = parseInt(cart.totals.total_items, 10) / Math.pow(10, minorUnit)
  const freeShippingRemaining = Math.max(0, opts.freeShippingThreshold - subtotalNum)

  const discounts = (cart.coupons ?? []).map((c) => ({
    code: c.code,
    amount: fmtStorePrice(c.totals.total_discount, minorUnit),
  }))

  return {
    items,
    subtotal: fmtStorePrice(cart.totals.total_items, minorUnit),
    total: fmtStorePrice(cart.totals.total_price, minorUnit),
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    discounts,
    freeShippingThreshold: opts.freeShippingThreshold,
    freeShippingRemaining,
    giftWrapEnabled: opts.giftWrapEnabled ?? false,
    giftWrapCost: opts.giftWrapCost,
  }
}

/* ── Public cart operations ───────────────────────── */

export async function storeGetCart(token?: string | null) {
  return storeRequest<StoreCart>('GET', '/cart', undefined, token)
}

export async function storeClearCart(token?: string | null) {
  return storeRequest<StoreCart>('DELETE', '/cart/items', undefined, token)
}

export async function storeAddItem(
  id: number,
  quantity: number,
  variationId?: number | null,
  token?: string | null
) {
  const body: Record<string, unknown> = { id, quantity }
  if (variationId) body.variation = [{ attribute: 'variation_id', value: String(variationId) }]
  return storeRequest<StoreCart>('POST', '/cart/add-item', body, token)
}

export async function storeUpdateItem(key: string, quantity: number, token?: string | null) {
  return storeRequest<StoreCart>('POST', '/cart/update-item', { key, quantity }, token)
}

export async function storeRemoveItem(key: string, token?: string | null) {
  // Schema confirms: POST /cart/remove-item (not DELETE) → returns full StoreCart
  return storeRequest<StoreCart>('POST', '/cart/remove-item', { key }, token)
}

export async function storeApplyCoupon(code: string, token?: string | null) {
  return storeRequest<StoreCart>('POST', '/cart/apply-coupon', { code }, token)
}

export async function storeRemoveCoupon(code: string, token?: string | null) {
  // Schema confirms: POST /cart/remove-coupon (not DELETE) → returns full StoreCart
  return storeRequest<StoreCart>('POST', '/cart/remove-coupon', { code }, token)
}
