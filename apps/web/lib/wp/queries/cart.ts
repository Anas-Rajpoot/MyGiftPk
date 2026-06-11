/* WooGraphQL cart queries + mutations.
   All cart operations go through Next.js route handlers — never called client-side. */

export const GET_CART = `
  query GetCart {
    cart {
      subtotal
      total
      discountTotal
      contentsTotal
      appliedCoupons { code discountAmount }
      contents(first: 50) {
        nodes {
          key quantity subtotal total
          product {
            node {
              id databaseId slug name
              image { sourceUrl altText }
            }
          }
          variation {
            node {
              databaseId
              attributes { nodes { name value } }
            }
          }
        }
      }
    }
  }
`

export const ADD_TO_CART = `
  mutation AddToCart($productId: Int!, $variationId: Int, $quantity: Int, $extraData: String) {
    addToCart(input: {
      productId: $productId
      variationId: $variationId
      quantity: $quantity
      extraData: $extraData
    }) {
      cartItem { key }
      cart {
        subtotal total discountTotal
        appliedCoupons { code discountAmount }
        contents(first: 50) {
          nodes {
            key quantity subtotal total
            product { node { id databaseId slug name image { sourceUrl altText } } }
            variation { node { databaseId attributes { nodes { name value } } } }
          }
        }
      }
    }
  }
`

export const UPDATE_ITEM_QUANTITIES = `
  mutation UpdateItemQuantities($items: [CartItemQuantityInput]!) {
    updateItemQuantities(input: { items: $items }) {
      cart {
        subtotal total discountTotal
        appliedCoupons { code discountAmount }
        contents(first: 50) {
          nodes {
            key quantity subtotal total
            product { node { id databaseId slug name image { sourceUrl altText } } }
            variation { node { databaseId attributes { nodes { name value } } } }
          }
        }
      }
    }
  }
`

export const REMOVE_ITEMS_FROM_CART = `
  mutation RemoveItemsFromCart($keys: [ID]!) {
    removeItemsFromCart(input: { keys: $keys }) {
      cart {
        subtotal total discountTotal
        appliedCoupons { code discountAmount }
        contents(first: 50) {
          nodes {
            key quantity subtotal total
            product { node { id databaseId slug name image { sourceUrl altText } } }
            variation { node { databaseId attributes { nodes { name value } } } }
          }
        }
      }
    }
  }
`

export const APPLY_COUPON = `
  mutation ApplyCoupon($code: String!) {
    applyCoupon(input: { code: $code }) {
      cart {
        subtotal total discountTotal
        appliedCoupons { code discountAmount }
        contents(first: 50) {
          nodes {
            key quantity subtotal total
            product { node { id databaseId slug name image { sourceUrl altText } } }
            variation { node { databaseId attributes { nodes { name value } } } }
          }
        }
      }
    }
  }
`

export const REMOVE_COUPON = `
  mutation RemoveCoupon($code: String!) {
    removeCoupons(input: { codes: [$code] }) {
      cart {
        subtotal total discountTotal
        appliedCoupons { code discountAmount }
        contents(first: 50) {
          nodes {
            key quantity subtotal total
            product { node { id databaseId slug name image { sourceUrl altText } } }
            variation { node { databaseId attributes { nodes { name value } } } }
          }
        }
      }
    }
  }
`

/* ── Raw WooGraphQL types ─────────────────────────── */

export interface WooCartItem {
  key: string
  quantity: number
  subtotal: string
  total: string
  product: {
    node: {
      id: string
      databaseId: number
      slug: string
      name: string
      image: { sourceUrl: string; altText: string } | null
    }
  }
  variation: {
    node: {
      databaseId: number
      attributes: { nodes: { name: string; value: string }[] }
    }
  } | null
}

export interface WooCart {
  subtotal: string
  total: string
  discountTotal: string
  contentsTotal?: string
  appliedCoupons: { code: string; discountAmount: string }[]
  contents: { nodes: WooCartItem[] }
}
