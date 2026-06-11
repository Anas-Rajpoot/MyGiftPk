import { NextRequest } from 'next/server'
import { storeApplyCoupon, storeRemoveCoupon } from '@/lib/woo/store-cart'
import { APPLY_COUPON, REMOVE_COUPON } from '@/lib/wp/queries/cart'
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

export async function POST(req: NextRequest) {
  if (MOCK_MODE && !WOO_REST_ENABLED) {
    return cartResponse({
      ...MOCK_CART,
      discounts: [{ code: 'DEMO10', amount: 'Rs. 920' }],
      total: 'Rs. 8,280',
    })
  }

  let body: { code: string }
  try {
    body = await req.json()
  } catch {
    return errorResponse('Invalid request body', 400)
  }

  const { code } = body
  if (!code) return errorResponse('code is required', 400)

  if (WOO_REST_ENABLED) {
    try {
      const token = await getCartToken()
      const { data, newToken } = await storeApplyCoupon(code, token)
      const cart = await buildStoreCartData(data)
      return cartResponse(cart, newToken, true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Invalid coupon code'
      return errorResponse(msg, 422)
    }
  }

  try {
    const token = await getSessionToken()
    const { data, newSessionToken } = await wooMutate<Record<string, { cart: WooCart }>>(
      APPLY_COUPON, { code }, token
    )
    const wooCart = extractCart(data as unknown as Record<string, WooCart>)
    if (!wooCart) return errorResponse('Empty cart response')
    const cart = await buildCartData(wooCart)
    return cartResponse(cart, newSessionToken)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid coupon code'
    return errorResponse(msg, 422)
  }
}

export async function DELETE(req: NextRequest) {
  if (MOCK_MODE && !WOO_REST_ENABLED) return cartResponse(MOCK_CART)

  let body: { code: string }
  try {
    body = await req.json()
  } catch {
    return errorResponse('Invalid request body', 400)
  }

  const { code } = body
  if (!code) return errorResponse('code is required', 400)

  if (WOO_REST_ENABLED) {
    try {
      const token = await getCartToken()
      const { data, newToken } = await storeRemoveCoupon(code, token)
      const cart = await buildStoreCartData(data)
      return cartResponse(cart, newToken, true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to remove coupon'
      return errorResponse(msg)
    }
  }

  try {
    const token = await getSessionToken()
    const { data, newSessionToken } = await wooMutate<Record<string, { cart: WooCart }>>(
      REMOVE_COUPON, { code }, token
    )
    const wooCart = extractCart(data as unknown as Record<string, WooCart>)
    if (!wooCart) return errorResponse('Empty cart response')
    const cart = await buildCartData(wooCart)
    return cartResponse(cart, newSessionToken)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to remove coupon'
    return errorResponse(msg)
  }
}
