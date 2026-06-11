import type { WooCart, WooCartItem } from '@/lib/wp/queries/cart'

export interface CartLineItem {
  key: string
  productId: number
  variationId: number | null
  slug: string
  name: string
  image: { sourceUrl: string; altText: string } | null
  variationLabel: string
  quantity: number
  unitPrice: string
  lineTotal: string
}

export interface CartData {
  items: CartLineItem[]
  subtotal: string
  total: string
  itemCount: number
  discounts: { code: string; amount: string }[]
  freeShippingThreshold: number
  freeShippingRemaining: number
  giftWrapEnabled: boolean
  giftWrapCost: string
}

export function parseRsPrice(str: string): number {
  return parseFloat(str.replace(/[^0-9.]/g, '')) || 0
}

function buildVariationLabel(item: WooCartItem): string {
  const attrs = item.variation?.node.attributes.nodes ?? []
  return attrs
    .map((a) => a.value)
    .filter(Boolean)
    .join(' / ')
}

function computeUnitPrice(item: WooCartItem): string {
  if (item.quantity <= 1) return item.total
  const total = parseRsPrice(item.total)
  const unit = total / item.quantity
  return `Rs. ${unit.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`
}

export function normalizeCart(
  wooCart: WooCart,
  opts: { freeShippingThreshold: number; giftWrapCost: string; giftWrapEnabled?: boolean }
): CartData {
  const items: CartLineItem[] = wooCart.contents.nodes.map((n) => ({
    key: n.key,
    productId: n.product.node.databaseId,
    variationId: n.variation?.node.databaseId ?? null,
    slug: n.product.node.slug,
    name: n.product.node.name,
    image: n.product.node.image,
    variationLabel: buildVariationLabel(n),
    quantity: n.quantity,
    unitPrice: computeUnitPrice(n),
    lineTotal: n.total,
  }))

  const subtotalNum = parseRsPrice(wooCart.subtotal)
  const freeShippingRemaining = Math.max(0, opts.freeShippingThreshold - subtotalNum)

  return {
    items,
    subtotal: wooCart.subtotal,
    total: wooCart.total,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    discounts: wooCart.appliedCoupons.map((c) => ({ code: c.code, amount: c.discountAmount })),
    freeShippingThreshold: opts.freeShippingThreshold,
    freeShippingRemaining,
    giftWrapEnabled: opts.giftWrapEnabled ?? false,
    giftWrapCost: opts.giftWrapCost,
  }
}
