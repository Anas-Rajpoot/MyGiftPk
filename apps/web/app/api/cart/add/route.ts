import { NextRequest, NextResponse } from 'next/server'
import { validateOrigin } from '@/lib/utils/csrf'
import { MOCK_MODE, WOO_REST_ENABLED, MOCK_CART } from '@/lib/cart/route-helpers'
import { readCartState, addItem, writeCartState, buildCartData, emptyCart } from '@/lib/cart/server-cart'

interface AddPayload {
  productId: number
  variationId?: number | null
  quantity?: number
}

export async function POST(req: NextRequest) {
  if (!validateOrigin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let body: AddPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { productId, variationId = null, quantity = 1 } = body
  if (!productId || typeof productId !== 'number') {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 })
  }

  if (!WOO_REST_ENABLED) {
    return NextResponse.json(MOCK_MODE ? MOCK_CART : emptyCart())
  }

  try {
    const state = await readCartState()
    addItem(state, { productId, variationId: variationId ?? null, quantity: Math.max(1, quantity) })
    const cart = await buildCartData(state)
    const res = NextResponse.json(cart)
    writeCartState(res, state)
    return res
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to add to cart'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
