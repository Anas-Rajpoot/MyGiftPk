export const GET_GIFT_BUILDER_OPTIONS = `
  query GetGiftBuilderOptions {
    giftBuilderOptions {
      boxes { id name image { sourceUrl } basePrice capacity }
      components {
        productId name image { sourceUrl }
        price category stockStatus stockQuantity
      }
      addOns { id name price }
      categories
      messageCharLimit
      ribbonColors
      occasions
    }
  }
`

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

export interface GiftBuilderOptionsResponse {
  giftBuilderOptions: GiftBuilderOptions
}
