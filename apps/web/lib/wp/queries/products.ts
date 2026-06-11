export const GET_PRODUCTS = `
  query GetProducts($first: Int = 8, $categorySlug: String) {
    products(
      first: $first
      where: { category: $categorySlug, status: "publish" }
    ) {
      nodes {
        id
        databaseId
        slug
        name
        type
        image { sourceUrl altText }
        price
        regularPrice
        salePrice
        onSale
        stockStatus
        productCategories { nodes { slug name } }
        attributes { nodes { name options } }
      }
    }
  }
`

export const GET_FEATURED_PRODUCTS = `
  query GetFeaturedProducts($categorySlug: String, $first: Int = 8) {
    products(
      first: $first
      where: { category: $categorySlug, status: "publish" }
    ) {
      nodes {
        id
        databaseId
        slug
        name
        image { sourceUrl altText }
        price
        regularPrice
        salePrice
        onSale
        stockStatus
      }
    }
  }
`

export interface ProductNode {
  id: string
  databaseId: number
  slug: string
  name: string
  image: { sourceUrl: string; altText: string } | null
  price: string
  regularPrice: string
  salePrice: string | null
  onSale: boolean
  stockStatus: string
}

export interface ProductsResponse {
  products: { nodes: ProductNode[] }
}
