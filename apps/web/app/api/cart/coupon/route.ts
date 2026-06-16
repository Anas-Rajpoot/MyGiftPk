import { NextRequest, NextResponse } from 'next/server'
import { validateOrigin } from '@/lib/utils/csrf'
import { WOO_REST_ENABLED } from '@/lib/cart/route-helpers'
import {
  readCartState, writeCartState, buildCartData, couponExists, emptyCart,
} from '@/lib/cart/server-cart'

export async function POST(req: NextRequest) {
  if (!validateOrigin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let body: { code: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const code = body.code?.trim()
  if (!code) return NextResponse.json({ error: 'code is required' }, { status: 400 })
  if (!WOO_REST_ENABLED) return NextResponse.json(emptyCart())

  try {
    const exists = await couponExists(code)
    if (!exists) {
      return NextResponse.json({ error: 'This coupon code is not valid.' }, { status: 422 })
    }
    const state = await readCartState()
    if (!state.coupons.some((c) => c.toLowerCase() === code.toLowerCase())) {
      state.coupons.push(code)
    }
    const cart = await buildCartData(state)
    const res = NextResponse.json(cart)
    writeCartState(res, state)
    return res
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Could not apply coupon' }, { status: 422 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!validateOrigin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let body: { code: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const code = body.code?.trim()
  if (!code) return NextResponse.json({ error: 'code is required' }, { status: 400 })
  if (!WOO_REST_ENABLED) return NextResponse.json(emptyCart())

  try {
    const state = await readCartState()
    state.coupons = state.coupons.filter((c) => c.toLowerCase() !== code.toLowerCase())
    const cart = await buildCartData(state)
    const res = NextResponse.json(cart)
    writeCartState(res, state)
    return res
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to remove coupon' }, { status: 500 })
  }
}
