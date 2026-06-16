import { NextRequest, NextResponse } from 'next/server'
import { validateOrigin } from '@/lib/utils/csrf'
import { WOO_REST_ENABLED } from '@/lib/cart/route-helpers'
import {
  readCartState, setQty, removeItemByKey, writeCartState, buildCartData, emptyCart,
} from '@/lib/cart/server-cart'

export async function PATCH(req: NextRequest) {
  if (!validateOrigin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let body: { key: string; quantity: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { key, quantity } = body
  if (!key || typeof quantity !== 'number') {
    return NextResponse.json({ error: 'key and quantity are required' }, { status: 400 })
  }
  if (!WOO_REST_ENABLED) return NextResponse.json(emptyCart())

  try {
    const state = setQty(await readCartState(), key, Math.max(0, Math.min(99, Math.trunc(quantity))))
    const cart = await buildCartData(state)
    const res = NextResponse.json(cart)
    writeCartState(res, state)
    return res
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to update item' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!validateOrigin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let body: { key: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { key } = body
  if (!key) return NextResponse.json({ error: 'key is required' }, { status: 400 })
  if (!WOO_REST_ENABLED) return NextResponse.json(emptyCart())

  try {
    const state = removeItemByKey(await readCartState(), key)
    const cart = await buildCartData(state)
    const res = NextResponse.json(cart)
    writeCartState(res, state)
    return res
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to remove item' }, { status: 500 })
  }
}
