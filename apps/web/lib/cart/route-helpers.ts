/* Shared helpers for /api/cart/* route handlers — server-only. */

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { fetchGlobalOptions, DEFAULT_GLOBAL } from '@/lib/wp/home-content'
import { normalizeCart } from '@/lib/cart/normalize'
import { normalizeStoreCart } from '@/lib/woo/store-cart'
import type { WooCart } from '@/lib/wp/queries/cart'
import { MOCK_CART } from '@/lib/cart/mock'
import type { CartData } from '@/lib/cart/normalize'

export const MOCK_MODE = process.env.MOCK_MODE === 'true'
export const WOO_REST_ENABLED = Boolean(
  process.env.WP_GRAPHQL_URL && process.env.WC_CONSUMER_KEY && process.env.WC_CONSUMER_SECRET
)

// WooGraphQL session cookie (used when WooGraphQL IS installed)
const WOO_SESSION_COOKIE = 'woo-session'
// WooCommerce Store API cart token cookie (used when WooGraphQL is NOT installed)
const CART_TOKEN_COOKIE = 'woo-cart-token'

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 14,
  path: '/',
}

/** Read WooGraphQL session token (for WooGraphQL path). */
export async function getSessionToken(): Promise<string | null> {
  const store = await cookies()
  return store.get(WOO_SESSION_COOKIE)?.value ?? null
}

/** Read WooCommerce Store API cart token (for Store API path). */
export async function getCartToken(): Promise<string | null> {
  const store = await cookies()
  return store.get(CART_TOKEN_COOKIE)?.value ?? null
}

async function getGlobalOpts() {
  return (await fetchGlobalOptions()) ?? DEFAULT_GLOBAL
}

/** Return CartData JSON and optionally update the session cookie. */
export function cartResponse(cart: CartData, newToken?: string | null, isStoreApi = false): NextResponse {
  const res = NextResponse.json(cart)
  if (newToken) {
    const cookieName = isStoreApi ? CART_TOKEN_COOKIE : WOO_SESSION_COOKIE
    res.cookies.set(cookieName, newToken, COOKIE_OPTS)
  }
  return res
}

export function errorResponse(message: string, status = 500): NextResponse {
  return NextResponse.json({ error: message }, { status })
}

/** Build CartData from a WooGraphQL WooCart. */
export async function buildCartData(wooCart: WooCart, giftWrapEnabled = false): Promise<CartData> {
  const opts = await getGlobalOpts()
  return normalizeCart(wooCart, {
    freeShippingThreshold: opts?.freeShippingThreshold ?? 3000,
    giftWrapCost: `Rs. ${opts?.giftWrapPrice ?? 150}`,
    giftWrapEnabled,
  })
}

/** Build CartData from a WooCommerce Store API cart (no graphql needed). */
export async function buildStoreCartData(
  storeCart: Parameters<typeof normalizeStoreCart>[0],
  giftWrapEnabled = false
): Promise<CartData> {
  const opts = await getGlobalOpts()
  return normalizeStoreCart(storeCart, {
    freeShippingThreshold: opts?.freeShippingThreshold ?? 3000,
    giftWrapCost: `Rs. ${opts?.giftWrapPrice ?? 150}`,
    giftWrapEnabled,
  })
}

/** Extract WooCart from a WooGraphQL mutation response. */
export function extractCart(data: Record<string, { cart?: WooCart } | WooCart | undefined>): WooCart | null {
  for (const val of Object.values(data)) {
    if (val && typeof val === 'object') {
      if ('contents' in val) return val as WooCart
      if ('cart' in (val as object) && (val as { cart?: WooCart }).cart) {
        return (val as { cart: WooCart }).cart
      }
    }
  }
  return null
}

export { MOCK_CART }
