import { NextResponse } from 'next/server'
import { MOCK_MODE, WOO_REST_ENABLED, MOCK_CART } from '@/lib/cart/route-helpers'
import { readCartState, buildCartData, writeCartState, emptyCart } from '@/lib/cart/server-cart'

export async function GET() {
  if (WOO_REST_ENABLED) {
    try {
      const cart = await buildCartData(await readCartState())
      return NextResponse.json(cart)
    } catch {
      return NextResponse.json(emptyCart())
    }
  }
  if (MOCK_MODE) return NextResponse.json(MOCK_CART)
  return NextResponse.json(emptyCart())
}

export async function DELETE() {
  const res = NextResponse.json(emptyCart())
  writeCartState(res, { items: [], coupons: [] })
  return res
}
