import type { ProductNode } from './products'
import type { WpImage } from './home'

export const GET_SHOP_PRODUCTS = `
  query GetShopProducts(
    $first: Int = 8
    $categorySlug: String
    $type: String
    $onSale: Boolean
  ) {
    products(
      first: $first
      where: { category: $categorySlug, attribute: $type, onSale: $onSale, status: "publish" }
    ) {
      found
      pageInfo { hasNextPage }
      nodes {
        id databaseId slug name
        image { sourceUrl altText }
        price regularPrice salePrice onSale stockStatus
        productCategories { nodes { slug name } }
      }
    }
  }
`

export const GET_CATEGORY_WITH_PRODUCTS = `
  query GetCategoryWithProducts(
    $slug: ID!
    $first: Int = 8
    $type: String
    $onSale: Boolean
  ) {
    productCategory(id: $slug, idType: SLUG) {
      id slug name description count
      image { sourceUrl altText }
      acfCategoryIntro { intro }
      seo {
        title metaDesc canonical
        opengraphTitle opengraphDescription
        opengraphImage { sourceUrl }
      }
    }
    products(
      first: $first
      where: { category: $slug, attribute: $type, onSale: $onSale, status: "publish" }
    ) {
      found
      pageInfo { hasNextPage }
      nodes {
        id databaseId slug name
        image { sourceUrl altText }
        price regularPrice salePrice onSale stockStatus
      }
    }
  }
`

export const GET_PRODUCT = `
  query GetProduct($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      id databaseId slug name type sku
      description shortDescription
      image { sourceUrl altText }
      galleryImages(first: 6) { nodes { sourceUrl altText } }
      price regularPrice salePrice onSale stockStatus
      productCategories { nodes { slug name } }
      attributes { nodes { name label options variation } }
      ... on VariableProduct {
        variations(first: 50) {
          nodes {
            databaseId price regularPrice salePrice stockStatus stockQuantity
            attributes { nodes { name value } }
          }
        }
      }
      related(first: 4) {
        nodes {
          id databaseId slug name
          image { sourceUrl altText }
          price regularPrice salePrice onSale stockStatus
        }
      }
      seo {
        title metaDesc canonical
        opengraphTitle opengraphDescription
        opengraphImage { sourceUrl }
      }
    }
  }
`

export const GET_PRODUCT_SLUGS = `
  query GetProductSlugs($first: Int = 100) {
    products(first: $first, where: { status: "publish" }) {
      nodes { slug }
    }
  }
`

export const GET_CATEGORY_SLUGS = `
  query GetCategorySlugs {
    productCategories(first: 50, where: { hideEmpty: true }) {
      nodes { slug }
    }
  }
`

/* ── Types ────────────────────────────────────────── */

export interface WpSeo {
  title: string
  metaDesc: string
  canonical?: string
  opengraphTitle?: string
  opengraphDescription?: string
  opengraphImage?: WpImage | null
}

export interface ProductAttribute {
  name: string
  label: string
  options: string[]
  variation: boolean
}

export interface ProductVariationAttr {
  name: string
  value: string
}

export interface ProductVariation {
  databaseId: number
  price: string
  regularPrice: string
  salePrice: string | null
  stockStatus: string
  stockQuantity: number | null
  attributes: { nodes: ProductVariationAttr[] }
}

export interface ProductFull extends ProductNode {
  type: string
  sku: string
  description: string
  shortDescription: string
  galleryImages: { nodes: WpImage[] }
  attributes: { nodes: ProductAttribute[] }
  variations?: { nodes: ProductVariation[] }
  related?: { nodes: ProductNode[] }
  productCategories: { nodes: { slug: string; name: string }[] }
  seo: WpSeo
}

export interface CategoryData {
  id: string
  slug: string
  name: string
  description: string
  count: number
  image: WpImage | null
  acfCategoryIntro?: { intro?: string } | null
  seo: WpSeo
}

export interface ShopProductsData {
  products: {
    found: number
    pageInfo: { hasNextPage: boolean }
    nodes: ProductNode[]
  }
}

export interface CategoryPageData {
  productCategory: CategoryData
  products: {
    found: number
    pageInfo: { hasNextPage: boolean }
    nodes: ProductNode[]
  }
}

export interface ProductPageData {
  product: ProductFull | null
}
