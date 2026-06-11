import type { CartData } from './normalize'

export const MOCK_CART: CartData = {
  items: [
    {
      key: 'mock-item-1',
      productId: 1,
      variationId: 101,
      slug: 'mock-product-1',
      name: 'Red Lawn 3-Piece Unstitched',
      image: null,
      variationLabel: 'Stitched / M',
      quantity: 1,
      unitPrice: 'Rs. 3,200',
      lineTotal: 'Rs. 3,200',
    },
    {
      key: 'mock-item-2',
      productId: 2,
      variationId: null,
      slug: 'mock-product-2',
      name: 'Ivory Embroidered Kurta',
      image: null,
      variationLabel: '',
      quantity: 2,
      unitPrice: 'Rs. 3,000',
      lineTotal: 'Rs. 6,000',
    },
  ],
  subtotal: 'Rs. 9,200',
  total: 'Rs. 9,200',
  itemCount: 3,
  discounts: [],
  freeShippingThreshold: 3000,
  freeShippingRemaining: 0,
  giftWrapEnabled: false,
  giftWrapCost: 'Rs. 150',
}

export const MOCK_EMPTY_CART: CartData = {
  items: [],
  subtotal: 'Rs. 0',
  total: 'Rs. 0',
  itemCount: 0,
  discounts: [],
  freeShippingThreshold: 3000,
  freeShippingRemaining: 3000,
  giftWrapEnabled: false,
  giftWrapCost: 'Rs. 150',
}
