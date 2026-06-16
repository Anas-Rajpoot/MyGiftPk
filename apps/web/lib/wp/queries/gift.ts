/**
 * Gift Builder options are now served by the native mygift-core REST endpoint
 * (`/wp-json/mygift/v1/gift-builder`) via lib/wp/home-content.ts
 * (`fetchGiftBuilderOptions`). The interfaces below are the shared shape.
 */

export interface GiftBox {
  id: number
  name: string
  image: { sourceUrl: string } | null
  basePrice: number
  capacity: number
}

export interface GiftComponent {
  productId: number
  name: string
  image: { sourceUrl: string } | null
  price: number
  category: string
  stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK'
  stockQuantity: number | null
}

export interface GiftAddOn {
  id: number
  name: string
  price: number
}

export interface GiftBuilderOptions {
  boxes: GiftBox[]
  components: GiftComponent[]
  addOns: GiftAddOn[]
  categories: string[]
  messageCharLimit: number
  ribbonColors: string[]
  occasions: string[]
}

