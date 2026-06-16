import { NextRequest, NextResponse } from 'next/server'
import { restCreateOrder, PAYMENT_METHODS, type RestOrderPayload } from '@/lib/woo/checkout'
import { getAuthUser } from '@/lib/auth/server'
import { validateOrigin } from '@/lib/utils/csrf'
import { clearCartCookie } from '@/lib/cart/server-cart'

/**
 * Order creation goes through the WooCommerce REST API (wc/v3/orders), NOT the
 * Store API cart. The Store API guest cart on this WC instance does not persist
 * between requests (the Cart-Token references a session that isn't saved), so we
 * build the order from the line items the client holds and let WooCommerce price
 * each item FROM THE LIVE CATALOG — the client never sends prices, so totals are
 * always server-trusted.
 */

interface ClientItem {
  productId: number
  variationId?: number | null
  quantity: number
}

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
  shipping?: CheckoutBody['billing']
  payment_method: string
  customer_note?: string
  items: ClientItem[]
  coupons?: string[]
}

const MOCK_MODE = process.env.MOCK_MODE === 'true'

const PAYMENT_TITLES: Record<string, string> = Object.fromEntries(
  PAYMENT_METHODS.map((m) => [m.id, m.label])
)

/** Create the order; if WC rejects the linked customer id, retry as a guest order. */
async function placeOrder(payload: RestOrderPayload) {
  try {
    return await restCreateOrder(payload)
  } catch (e) {
    const msg = e instanceof Error ? e.message : ''
    if (payload.customer_id && /customer id/i.test(msg)) {
      const { customer_id: _omit, ...guest } = payload
      void _omit
      return await restCreateOrder(guest)
    }
    throw e
  }
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

  const { billing, shipping_same, payment_method } = body

  // Validate billing
  if (!billing?.first_name || !billing?.last_name || !billing?.email ||
      !billing?.phone || !billing?.address_1 || !billing?.city ||
      !billing?.state || !billing?.country) {
    return NextResponse.json({ error: 'Billing address is incomplete' }, { status: 400 })
  }
  if (!payment_method || !PAYMENT_TITLES[payment_method]) {
    return NextResponse.json({ error: 'Please choose a valid payment method' }, { status: 400 })
  }

  // Validate + sanitize line items (prices come from the catalog, never the client)
  const rawItems = Array.isArray(body.items) ? body.items : []
  const line_items = rawItems
    .filter((i) => Number.isInteger(i.productId) && i.productId > 0)
    .map((i) => {
      const quantity = Math.max(1, Math.min(99, Math.trunc(Number(i.quantity) || 1)))
      return i.variationId
        ? { product_id: i.productId, variation_id: i.variationId, quantity }
        : { product_id: i.productId, quantity }
    })

  if (line_items.length === 0) {
    return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 })
  }

  const shippingAddr = shipping_same ? billing : (body.shipping ?? billing)
  const user = await getAuthUser()

  const payload: RestOrderPayload = {
    payment_method,
    payment_method_title: PAYMENT_TITLES[payment_method],
    set_paid: false,
    status: payment_method === 'bacs' ? 'on-hold' : 'processing',
    billing: {
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
    shipping: {
      first_name: shippingAddr.first_name,
      last_name: shippingAddr.last_name,
      address_1: shippingAddr.address_1,
      address_2: shippingAddr.address_2 ?? '',
      city: shippingAddr.city,
      state: shippingAddr.state,
      postcode: shippingAddr.postcode ?? '',
      country: shippingAddr.country,
      phone: shippingAddr.phone,
    },
    line_items,
    customer_note: body.customer_note ?? '',
    // Only link a real WooCommerce customer. In MOCK_MODE the auth user id is
    // synthetic and would be rejected ("Customer ID is invalid").
    ...(user && !MOCK_MODE ? { customer_id: user.id } : {}),
    ...(Array.isArray(body.coupons) && body.coupons.length
      ? { coupon_lines: body.coupons.filter(Boolean).map((code) => ({ code })) }
      : {}),
  }

  try {
    const order = await placeOrder(payload)
    const res = NextResponse.json({
      order_id: order.id,
      order_number: order.number,
      order_key: order.order_key ?? order.key,
      order_status: order.status,
      payment_redirect: null,
    })
    clearCartCookie(res) // empty the cart now that the order exists
    return res
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to place order'
    return NextResponse.json({ error: msg }, { status: 422 })
  }
}
