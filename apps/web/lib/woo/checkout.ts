/**
 * WooCommerce checkout via Store API — server-only.
 * Uses the same Cart-Token session as the cart.
 * Falls back to WooCommerce REST v3 order creation when Store API checkout
 * needs a nonce (older WC Blocks versions).
 */

const WP_BASE = (process.env.WP_GRAPHQL_URL ?? '').replace(/\/graphql\/?$/, '')
const WC_KEY = process.env.WC_CONSUMER_KEY ?? ''
const WC_SECRET = process.env.WC_CONSUMER_SECRET ?? ''
const STORE_BASE = `${WP_BASE}/wp-json/wc/store/v1`
const REST_BASE = `${WP_BASE}/wp-json/wc/v3`

function basicAuth() {
  return 'Basic ' + Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64')
}

/* ── Address shape ──────────────────────────────── */

export interface CheckoutAddress {
  first_name: string
  last_name: string
  address_1: string
  address_2: string
  city: string
  state: string        // WooCommerce state code e.g. "PB"
  postcode: string
  country: string      // ISO 2-letter e.g. "PK"
  email?: string       // billing only
  phone: string
}

export interface CheckoutPayload {
  billing_address: CheckoutAddress
  shipping_address: CheckoutAddress
  payment_method: string   // "cod" | "bacs"
  customer_note: string
  create_account: false
}

/* ── Store API checkout response ────────────────── */

export interface StoreCheckoutResponse {
  order_id: number
  order_key: string
  order_number: string
  order_status: string
  payment_result: {
    payment_status: string
    redirect_url: string
    payment_details: { key: string; value: string }[]
  }
}

/* ── WooCommerce REST v3 order (fallback) ─────── */

interface RestLineItem {
  product_id: number
  variation_id?: number
  quantity: number
}

export interface RestOrderPayload {
  payment_method: string
  payment_method_title: string
  set_paid: boolean
  status: string
  billing: CheckoutAddress
  shipping: Omit<CheckoutAddress, 'email'>
  line_items: RestLineItem[]
  customer_note: string
  customer_id?: number
  coupon_lines?: { code: string }[]
  meta_data?: { key: string; value: string }[]
}

export interface RestOrderResponse {
  id: number
  number: string
  key: string
  status: string
  order_key: string
}

/* ── Pakistan provinces (WooCommerce state codes) */

export const PK_PROVINCES: { code: string; label: string }[] = [
  { code: 'PB', label: 'Punjab' },
  { code: 'SD', label: 'Sindh' },
  { code: 'KP', label: 'Khyber Pakhtunkhwa' },
  { code: 'BA', label: 'Balochistan' },
  { code: 'IS', label: 'Islamabad Capital Territory' },
  { code: 'JK', label: 'Azad Jammu & Kashmir' },
  { code: 'GB', label: 'Gilgit-Baltistan' },
  { code: 'TA', label: 'FATA' },
]

/* ── Store API checkout ─────────────────────────── */

export async function storeCheckout(
  payload: CheckoutPayload,
  token: string | null
): Promise<StoreCheckoutResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) headers['Cart-Token'] = token

  const res = await fetch(`${STORE_BASE}/checkout`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  if (!res.ok) {
    let msg = `Checkout failed (${res.status})`
    try {
      const err = await res.json() as { message?: string; data?: { details?: Record<string, { message: string }[]> } }
      if (err.message) msg = err.message
      // WooCommerce validation errors come as data.details
      if (err.data?.details) {
        const first = Object.values(err.data.details).flat()[0]
        if (first?.message) msg = first.message
      }
    } catch { /* ignore */ }
    throw new Error(msg)
  }

  return res.json() as Promise<StoreCheckoutResponse>
}

/* ── WooCommerce REST v3 order creation (fallback / COD) */

export async function restCreateOrder(
  payload: RestOrderPayload
): Promise<RestOrderResponse> {
  const res = await fetch(`${REST_BASE}/orders`, {
    method: 'POST',
    headers: {
      Authorization: basicAuth(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  if (!res.ok) {
    let msg = `Order creation failed (${res.status})`
    try {
      const err = await res.json() as { message?: string }
      if (err.message) msg = err.message
    } catch { /* ignore */ }
    throw new Error(msg)
  }

  return res.json() as Promise<RestOrderResponse>
}

/* ── Payment method labels ──────────────────────── */

export const PAYMENT_METHODS = [
  { id: 'cod',  label: 'Cash on Delivery', description: 'Pay when your order arrives' },
  { id: 'bacs', label: 'Bank Transfer',    description: 'Transfer to our account; order ships after payment clears' },
] as const

export type PaymentMethodId = typeof PAYMENT_METHODS[number]['id']
