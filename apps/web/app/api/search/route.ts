import { NextRequest, NextResponse } from 'next/server'

const MOCK_MODE = process.env.MOCK_MODE === 'true'
const WP_BASE = (process.env.WP_GRAPHQL_URL ?? '').replace(/\/graphql\/?$/, '')
const WC_KEY = process.env.WC_CONSUMER_KEY ?? ''
const WC_SECRET = process.env.WC_CONSUMER_SECRET ?? ''
const WOO_REST_ENABLED = Boolean(WP_BASE && WC_KEY && WC_SECRET)

export interface SearchResult {
  id: number
  slug: string
  name: string
  price: string
  image: string | null
}

const MOCK_PRODUCTS = [
  { id: 1, slug: 'mock-product-1', name: 'Red Lawn 3-Piece Unstitched', price: 'Rs. 1,500', image: null },
  { id: 2, slug: 'mock-product-2', name: 'Ivory Embroidered Kurta', price: 'Rs. 3,000', image: null },
  { id: 3, slug: 'mock-product-3', name: 'Navy Blue Chiffon Suit', price: 'Rs. 4,500', image: null },
  { id: 4, slug: 'mock-product-4', name: 'Rose Pink Lawn Dupatta Set', price: 'Rs. 6,000', image: null },
  { id: 5, slug: 'mock-product-5', name: 'Teal Linen 2-Piece', price: 'Rs. 7,500', image: null },
  { id: 6, slug: 'mock-product-6', name: 'Classic White Kurta Shalwar', price: 'Rs. 9,000', image: null },
  { id: 7, slug: 'mock-product-7', name: 'Mustard Printed Shirt', price: 'Rs. 10,500', image: null },
  { id: 8, slug: 'mock-product-8', name: 'Charcoal Khaddar 3-Piece', price: 'Rs. 12,000', image: null },
]

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? ''
  if (q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  if (MOCK_MODE) {
    const lower = q.toLowerCase()
    const results = MOCK_PRODUCTS.filter((p) => p.name.toLowerCase().includes(lower)).slice(0, 8)
    return NextResponse.json({ results })
  }

  if (!WOO_REST_ENABLED) {
    return NextResponse.json({ results: [] })
  }

  try {
    const creds = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64')
    const url = new URL(`${WP_BASE}/wp-json/wc/v3/products`)
    url.searchParams.set('search', q)
    url.searchParams.set('per_page', '8')
    url.searchParams.set('status', 'publish')
    url.searchParams.set('stock_status', 'instock')

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Basic ${creds}` },
      next: { revalidate: 60 },
    })

    if (!res.ok) return NextResponse.json({ results: [] })

    const raw = await res.json()
    const results: SearchResult[] = raw.map((p: {
      id: number; slug: string; name: string; price: string;
      images: { src: string }[]
    }) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price ? `Rs. ${Math.round(parseFloat(p.price)).toLocaleString('en-PK')}` : '',
      image: p.images?.[0]?.src ?? null,
    }))

    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
