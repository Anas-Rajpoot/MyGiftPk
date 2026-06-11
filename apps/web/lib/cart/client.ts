'use client'

import type { CartData } from './normalize'

async function cartFetch(path: string, init?: RequestInit): Promise<CartData> {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  const json = await res.json()
  if (!res.ok) throw new Error((json as { error?: string }).error ?? `Cart API ${res.status}`)
  return json as CartData
}

export function fetchCart(): Promise<CartData> {
  return cartFetch('/api/cart')
}

export function addToCart(
  productId: number,
  variationId?: number | null,
  quantity = 1,
  meta?: Record<string, string>
): Promise<CartData> {
  return cartFetch('/api/cart/add', {
    method: 'POST',
    body: JSON.stringify({ productId, variationId, quantity, meta }),
  })
}

export function updateItemQty(key: string, quantity: number): Promise<CartData> {
  return cartFetch('/api/cart/item', {
    method: 'PATCH',
    body: JSON.stringify({ key, quantity }),
  })
}

export function removeItem(key: string): Promise<CartData> {
  return cartFetch('/api/cart/item', {
    method: 'DELETE',
    body: JSON.stringify({ key }),
  })
}

export function clearCart(): Promise<CartData> {
  return cartFetch('/api/cart', { method: 'DELETE' })
}

export function applyCoupon(code: string): Promise<CartData> {
  return cartFetch('/api/cart/coupon', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}

export function removeCoupon(code: string): Promise<CartData> {
  return cartFetch('/api/cart/coupon', {
    method: 'DELETE',
    body: JSON.stringify({ code }),
  })
}
