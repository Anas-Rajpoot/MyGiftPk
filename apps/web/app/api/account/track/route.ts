import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { validateOrigin } from '@/lib/utils/csrf'

const WP_BASE = (process.env.WP_GRAPHQL_URL ?? '').replace(/\/graphql\/?$/, '')
const WC_KEY = process.env.WC_CONSUMER_KEY ?? ''
const WC_SECRET = process.env.WC_CONSUMER_SECRET ?? ''
const WC_ENABLED = Boolean(WP_BASE && WC_KEY && WC_SECRET)

export async function POST(req: NextRequest) {
  if (!validateOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Throttle to prevent order-number/phone enumeration brute force
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (!checkRateLimit(`track:${ip}`, 10, 60_000)) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again in a minute.' },
      { status: 429 }
    )
  }

  let body: { orderNumber?: string; billingPhone?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { orderNumber, billingPhone } = body
  if (!orderNumber || !billingPhone) {
    return NextResponse.json({ error: 'Order number and billing phone are required' }, { status: 400 })
  }

  const cleanPhone = billingPhone.replace(/\D/g, '')

  // Real WooCommerce lookup only — no placeholder/dummy order.
  if (!WC_ENABLED) {
    return NextResponse.json({ error: 'Order tracking is not available right now.' }, { status: 503 })
  }

  try {
    const creds = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64')
    const url = new URL(`${WP_BASE}/wp-json/wc/v3/orders`)
    url.searchParams.set('number', orderNumber)
    url.searchParams.set('per_page', '1')

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Basic ${creds}` },
      cache: 'no-store',
    })

    if (!res.ok) return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })

    const orders = await res.json()
    if (!orders.length) return NextResponse.json({ error: 'No order found with those details' }, { status: 404 })

    const order = orders[0]
    // Verify billing phone matches (last 7+ digits to handle country code variance)
    const orderPhone = (order.billing?.phone ?? '').replace(/\D/g, '')
    const minLen = Math.min(cleanPhone.length, orderPhone.length, 7)
    if (cleanPhone.slice(-minLen) !== orderPhone.slice(-minLen)) {
      return NextResponse.json({ error: 'No order found with those details' }, { status: 404 })
    }

    return NextResponse.json({
      order: {
        id: order.id,
        number: order.number,
        status: order.status,
        dateCreated: order.date_created,
        total: order.total,
        currency: order.currency,
        lineItems: (order.line_items ?? []).map((li: { name: string; quantity: number; total: string }) => ({
          name: li.name,
          quantity: li.quantity,
          total: li.total,
        })),
      },
    })
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }
}
