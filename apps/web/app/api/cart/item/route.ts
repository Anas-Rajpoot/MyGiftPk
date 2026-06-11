import { NextRequest } from 'next/server'
import { storeUpdateItem, storeRemoveItem } from '@/lib/woo/store-cart'
import { UPDATE_ITEM_QUANTITIES, REMOVE_ITEMS_FROM_CART } from '@/lib/wp/queries/cart'
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

export async function PATCH(req: NextRequest) {
  if (MOCK_MODE && !WOO_REST_ENABLED) return cartResponse(MOCK_CART)

  let body: { key: string; quantity: number }
  try {
    body = await req.json()
  } catch {
    return errorResponse('Invalid request body', 400)
  }

  const { key, quantity } = body
  if (!key || typeof quantity !== 'number') {
    return errorResponse('key and quantity are required', 400)
  }

  if (WOO_REST_ENABLED) {
    try {
      const token = await getCartToken()
      const { data, newToken } = await storeUpdateItem(key, quantity, token)
      const cart = await buildStoreCartData(data)
      return cartResponse(cart, newToken, true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to update item'
      return errorResponse(msg)
    }
  }

  try {
    const token = await getSessionToken()
    const { data, newSessionToken } = await wooMutate<Record<string, { cart: WooCart }>>(
      UPDATE_ITEM_QUANTITIES, { items: [{ key, quantity }] }, token
    )
    const wooCart = extractCart(data as unknown as Record<string, WooCart>)
    if (!wooCart) return errorResponse('Empty cart response')
    const cart = await buildCartData(wooCart)
    return cartResponse(cart, newSessionToken)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to update item'
    return errorResponse(msg)
  }
}

export async function DELETE(req: NextRequest) {
  if (MOCK_MODE && !WOO_REST_ENABLED) return cartResponse(MOCK_CART)

  let body: { key: string }
  try {
    body = await req.json()
  } catch {
    return errorResponse('Invalid request body', 400)
  }

  const { key } = body
  if (!key) return errorResponse('key is required', 400)

  if (WOO_REST_ENABLED) {
    try {
      const token = await getCartToken()
      const { data, newToken } = await storeRemoveItem(key, token)
      const cart = await buildStoreCartData(data)
      return cartResponse(cart, newToken, true)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to remove item'
      return errorResponse(msg)
    }
  }

  try {
    const token = await getSessionToken()
    const { data, newSessionToken } = await wooMutate<Record<string, { cart: WooCart }>>(
      REMOVE_ITEMS_FROM_CART, { keys: [key] }, token
    )
    const wooCart = extractCart(data as unknown as Record<string, WooCart>)
    if (!wooCart) return errorResponse('Empty cart response')
    const cart = await buildCartData(wooCart)
    return cartResponse(cart, newSessionToken)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to remove item'
    return errorResponse(msg)
  }
}
