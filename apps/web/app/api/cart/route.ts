import { storeGetCart, storeClearCart } from '@/lib/woo/store-cart'
import { GET_CART } from '@/lib/wp/queries/cart'
import type { WooCart } from '@/lib/wp/queries/cart'
import { wooMutate } from '@/lib/wp/woo-mutate'
import {
  getSessionToken,
  getCartToken,
  buildCartData,
  buildStoreCartData,
  cartResponse,
  errorResponse,
  extractCart,
  MOCK_CART,
  MOCK_MODE,
  WOO_REST_ENABLED,
} from '@/lib/cart/route-helpers'

export async function DELETE() {
  if (!WOO_REST_ENABLED) return errorResponse('Not available', 400)
  try {
    const token = await getCartToken()
    const { data, newToken } = await storeClearCart(token)
    const cart = await buildStoreCartData(data)
    return cartResponse(cart, newToken, true)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to clear cart'
    return errorResponse(msg)
  }
}

export async function GET() {
  if (MOCK_MODE && !WOO_REST_ENABLED) return cartResponse(MOCK_CART)

  // Store API path (WooCommerce REST — no WooGraphQL needed)
  if (WOO_REST_ENABLED) {
    try {
      const token = await getCartToken()
      const { data, newToken } = await storeGetCart(token)
      const cart = await buildStoreCartData(data)
      return cartResponse(cart, newToken, true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch cart'
      return errorResponse(msg)
    }
  }

  // WooGraphQL path
  try {
    const token = await getSessionToken()
    const { data, newSessionToken } = await wooMutate<Record<string, WooCart>>(GET_CART, {}, token)
    const wooCart = extractCart(data) ?? {
      subtotal: 'Rs. 0', total: 'Rs. 0', discountTotal: 'Rs. 0',
      appliedCoupons: [], contents: { nodes: [] },
    }
    const cart = await buildCartData(wooCart)
    return cartResponse(cart, newSessionToken)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to fetch cart'
    return errorResponse(msg)
  }
}
