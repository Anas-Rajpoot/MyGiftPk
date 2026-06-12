import { NextRequest, NextResponse } from 'next/server'
import { MOCK_MODE } from '@/lib/cart/route-helpers'
import type { GiftBuilderOptions } from '@/lib/wp/queries/gift'
import type { CartData, CartLineItem } from '@/lib/cart/normalize'
import { MOCK_CART } from '@/lib/cart/mock'

// Fixture lookup at build time — safe because this is server-only
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fixtures } = require('@/lib/wp/fixtures') as { fixtures: Record<string, unknown> }

interface GiftPayload {
  boxId: number
  items: { productId: number; qty: number }[]
  addOns: number[]
  message: string
  ribbonColor: string
  occasion: string | null
  clientTotal: number
}

function getMockOptions(): GiftBuilderOptions | null {
  const f = fixtures.GetGiftBuilderOptions as { giftBuilderOptions?: GiftBuilderOptions } | undefined
  return f?.giftBuilderOptions ?? null
}

export async function POST(req: NextRequest) {
  let body: GiftPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { boxId, items, addOns, message, clientTotal } = body

  if (!boxId || typeof boxId !== 'number') {
    return NextResponse.json({ error: 'A box selection is required' }, { status: 400 })
  }
  if (!Array.isArray(items)) {
    return NextResponse.json({ error: 'Items must be an array' }, { status: 400 })
  }
  for (const item of items) {
    if (!item.productId || !Number.isInteger(item.qty) || item.qty < 1 || item.qty > 20) {
      return NextResponse.json({ error: `Invalid item quantity for product ${item.productId}` }, { status: 400 })
    }
  }

  const cleanMessage = (message ?? '')
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, 200)

  if (MOCK_MODE) {
    const opts = getMockOptions()
    if (!opts) {
      return NextResponse.json({ error: 'Gift builder is not configured' }, { status: 503 })
    }

    const box = opts.boxes.find((b) => b.id === boxId)
    if (!box) return NextResponse.json({ error: 'Invalid box selection' }, { status: 400 })

    const slotsUsed = items.reduce((s, i) => s + i.qty, 0)
    if (slotsUsed > box.capacity) {
      return NextResponse.json(
        { error: `Box capacity exceeded (max ${box.capacity} items, got ${slotsUsed})` },
        { status: 400 }
      )
    }

    let serverTotal = box.basePrice
    const itemBreakdown: { productId: number; name: string; qty: number; unitPrice: number }[] = []

    for (const { productId, qty } of items) {
      const comp = opts.components.find((c) => c.productId === productId)
      if (!comp) return NextResponse.json({ error: `Unknown component: ${productId}` }, { status: 400 })
      if (comp.stockStatus === 'OUT_OF_STOCK') {
        return NextResponse.json({ error: `${comp.name} is out of stock` }, { status: 400 })
      }
      serverTotal += comp.price * qty
      itemBreakdown.push({ productId, name: comp.name, qty, unitPrice: comp.price })
    }

    const addOnItems = (addOns ?? [])
      .map((id) => opts.addOns.find((a) => a.id === id))
      .filter((a): a is NonNullable<typeof a> => a !== undefined)

    for (const ao of addOnItems) serverTotal += ao.price

    if (typeof clientTotal === 'number' && Math.abs(clientTotal - serverTotal) > 1) {
      return NextResponse.json(
        {
          error: 'Prices have been updated. Please review the new total.',
          updatedTotal: serverTotal,
          breakdown: { base: box.basePrice, items: itemBreakdown, addOns: addOnItems },
        },
        { status: 409 }
      )
    }

    const bundleItem: CartLineItem = {
      key: `gift-bundle-${Date.now()}`,
      productId: 0,
      variationId: null,
      slug: 'custom-gift',
      name: `Custom Gift — ${box.name}`,
      image: null,
      variationLabel: cleanMessage ? `"${cleanMessage.slice(0, 40)}${cleanMessage.length > 40 ? '…' : ''}"` : '',
      quantity: 1,
      unitPrice: `Rs. ${serverTotal.toLocaleString('en-PK')}`,
      lineTotal: `Rs. ${serverTotal.toLocaleString('en-PK')}`,
    }

    const updatedCart: CartData = {
      ...MOCK_CART,
      items: [...MOCK_CART.items, bundleItem],
      itemCount: MOCK_CART.itemCount + 1,
    }

    return NextResponse.json(updatedCart)
  }

  // Real mode: requires WP plugin (mygift-core) with gift bundle container product.
  // Set GIFT_BUNDLE_PRODUCT_ID env var and install the WP plugin before enabling this path.
  return NextResponse.json(
    { error: 'Gift builder requires the mygift-core WP plugin. Set MOCK_MODE=true for development.' },
    { status: 503 }
  )
}
