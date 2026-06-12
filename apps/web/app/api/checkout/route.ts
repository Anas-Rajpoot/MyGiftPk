import { NextRequest, NextResponse } from 'next/server'
import { storeGetCart, storeClearCart } from '@/lib/woo/store-cart'
import { storeCheckout, type CheckoutPayload } from '@/lib/woo/checkout'
import { getCartToken, cartResponse } from '@/lib/cart/route-helpers'
import { validateOrigin } from '@/lib/utils/csrf'

interface CheckoutBody {
  billing: {
    first_name: string
    last_name: string
    email: string
    phone: string
    address_1: string
    address_2?: string
    city: string
    state: string
    postcode: string
    country: string
  }
  shipping_same: boolean
  shipping?: {
    first_name: string
    last_name: string
    phone: string
    address_1: string
    address_2?: string
    city: string
    state: string
    postcode: string
    country: string
  }
  payment_method: string
  customer_note?: string
}

export async function POST(req: NextRequest) {
  if (!validateOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: CheckoutBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Basic validation
  const { billing, shipping_same, payment_method } = body
  if (!billing?.first_name || !billing?.last_name || !billing?.email ||
      !billing?.phone || !billing?.address_1 || !billing?.city ||
      !billing?.state || !billing?.country) {
    return NextResponse.json({ error: 'Billing address is incomplete' }, { status: 400 })
  }
  if (!payment_method) {
    return NextResponse.json({ error: 'Payment method is required' }, { status: 400 })
  }

  const token = await getCartToken()

  // Verify cart is not empty before placing order
  try {
    const { data: cart } = await storeGetCart(token)
    if (!cart.items || cart.items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Could not read cart' }, { status: 500 })
  }

  const shippingAddr = shipping_same ? body.billing : (body.shipping ?? body.billing)

  const payload: CheckoutPayload = {
    billing_address: {
      first_name: billing.first_name,
      last_name: billing.last_name,
      address_1: billing.address_1,
      address_2: billing.address_2 ?? '',
      city: billing.city,
      state: billing.state,
      postcode: billing.postcode ?? '',
      country: billing.country,
      email: billing.email,
      phone: billing.phone,
    },
    shipping_address: {
      first_name: shippingAddr.first_name,
      last_name: shippingAddr.last_name,
      address_1: shippingAddr.address_1,
      address_2: (shippingAddr as CheckoutBody['billing']).address_2 ?? '',
      city: shippingAddr.city,
      state: shippingAddr.state,
      postcode: (shippingAddr as CheckoutBody['billing']).postcode ?? '',
      country: shippingAddr.country,
      phone: shippingAddr.phone,
    },
    payment_method,
    customer_note: body.customer_note ?? '',
    create_account: false,
  }

  try {
    const order = await storeCheckout(payload, token)

    // Clear the cart session after successful order
    try {
      const { data: emptyCart, newToken } = await storeClearCart(token)
      // Build response with order info + updated (empty) cart cookie
      const res = NextResponse.json({
        order_id: order.order_id,
        order_number: order.order_number,
        order_key: order.order_key,
        order_status: order.order_status,
        payment_redirect: order.payment_result?.redirect_url ?? null,
      })
      if (newToken) {
        res.cookies.set('woo-cart-token', newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 14,
          path: '/',
        })
      }
      // Also reset the cart in the cookie by deleting the token so next load is fresh
      res.cookies.delete('woo-cart-token')
      return res
    } catch {
      // Order was placed; cart clear failing is non-fatal
      return NextResponse.json({
        order_id: order.order_id,
        order_number: order.order_number,
        order_key: order.order_key,
        order_status: order.order_status,
        payment_redirect: order.payment_result?.redirect_url ?? null,
      })
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to place order'
    return NextResponse.json({ error: msg }, { status: 422 })
  }
}
