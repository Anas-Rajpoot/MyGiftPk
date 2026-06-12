import { NextRequest } from 'next/server'
import { storeAddItem } from '@/lib/woo/store-cart'
import { ADD_TO_CART } from '@/lib/wp/queries/cart'
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
import { validateOrigin } from '@/lib/utils/csrf'

interface AddPayload {
  productId: number
  variationId?: number | null
  quantity?: number
  meta?: Record<string, string>
}

export async function POST(req: NextRequest) {
  if (!validateOrigin(req)) return errorResponse('Forbidden', 403)

  if (MOCK_MODE && !WOO_REST_ENABLED) return cartResponse(MOCK_CART)

  let body: AddPayload
  try {
    body = await req.json()
  } catch {
    return errorResponse('Invalid request body', 400)
  }

  const { productId, variationId, quantity = 1 } = body

  if (!productId || typeof productId !== 'number') {
    return errorResponse('productId is required', 400)
  }

  // Store API path
  if (WOO_REST_ENABLED) {
    try {
      const token = await getCartToken()
      const { data, newToken } = await storeAddItem(productId, quantity, variationId, token)
      const cart = await buildStoreCartData(data)
      return cartResponse(cart, newToken, true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to add to cart'
      return errorResponse(msg)
    }
  }

  // WooGraphQL path
  try {
    const token = await getSessionToken()
    const { data, newSessionToken } = await wooMutate<Record<string, { cart: WooCart }>>(
      ADD_TO_CART,
      { productId, variationId: variationId ?? null, quantity },
      token
    )
    const wooCart = extractCart(data as unknown as Record<string, WooCart>)
    if (!wooCart) return errorResponse('Empty cart response from WooCommerce')
    const cart = await buildCartData(wooCart)
    return cartResponse(cart, newSessionToken)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to add to cart'
    return errorResponse(msg)
  }
}
