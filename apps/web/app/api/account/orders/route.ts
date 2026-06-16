import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/server'

const WP_BASE = (process.env.WP_GRAPHQL_URL ?? '').replace(/\/graphql\/?$/, '')
const WC_KEY = process.env.WC_CONSUMER_KEY ?? ''
const WC_SECRET = process.env.WC_CONSUMER_SECRET ?? ''
const WC_ENABLED = Boolean(WP_BASE && WC_KEY && WC_SECRET)

export interface OrderSummary {
  id: number
  number: string
  status: string
  dateCreated: string
  total: string
  currency: string
  lineItems: { name: string; quantity: number; total: string }[]
}

export async function GET() {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Always use real WooCommerce orders (no placeholder/dummy data).
  if (!WC_ENABLED) {
    return NextResponse.json({ orders: [] })
  }

  try {
    const creds = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64')
    const url = new URL(`${WP_BASE}/wp-json/wc/v3/orders`)
    url.searchParams.set('customer', String(user.id))
    url.searchParams.set('per_page', '20')
    url.searchParams.set('orderby', 'date')
    url.searchParams.set('order', 'desc')

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Basic ${creds}` },
      cache: 'no-store',
    })

    if (!res.ok) {
      return NextResponse.json({ orders: [] })
    }

    const raw = await res.json()
    const orders: OrderSummary[] = raw.map((o: {
      id: number; number: string; status: string;
      date_created: string; total: string; currency: string;
      line_items: { name: string; quantity: number; total: string }[]
    }) => ({
      id: o.id,
      number: o.number,
      status: o.status,
      dateCreated: o.date_created,
      total: o.total,
      currency: o.currency,
      lineItems: (o.line_items ?? []).map((li) => ({
        name: li.name,
        quantity: li.quantity,
        total: li.total,
      })),
    }))

    return NextResponse.json({ orders })
  } catch {
    return NextResponse.json({ orders: [] })
  }
}
