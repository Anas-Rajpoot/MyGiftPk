/**
 * WooCommerce REST API client — server-only.
 * Used when WooGraphQL is not installed on the WP site.
 * Works regardless of MOCK_MODE (MOCK_MODE only applies to fetchGraphQL).
 */

import { cache } from 'react'
import type { ProductNode } from '@/lib/wp/queries/products'
import type {
  ProductFull,
  CategoryData,
  ProductAttribute,
  ProductVariation,
  WpSeo,
} from '@/lib/wp/queries/shop'

/* ── Config ───────────────────────────────────────── */

const WP_BASE = (process.env.WP_GRAPHQL_URL ?? '').replace(/\/graphql\/?$/, '')
const WC_KEY = process.env.WC_CONSUMER_KEY ?? ''
const WC_SECRET = process.env.WC_CONSUMER_SECRET ?? ''

export const WOO_REST_ENABLED = Boolean(WP_BASE && WC_KEY && WC_SECRET)

function auth() {
  return 'Basic ' + Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64')
}

/* ── REST shapes ──────────────────────────────────── */

interface WooImage { src: string; alt: string }

interface WooAttribute {
  id: number
  name: string
  options: string[]
  variation: boolean
}

interface WooCategory { id: number; name: string; slug: string }

interface WooRestProduct {
  id: number
  name: string
  slug: string
  type: string
  price: string
  regular_price: string
  sale_price: string
  on_sale: boolean
  stock_status: string
  images: WooImage[]
  categories: WooCategory[]
  description: string
  short_description: string
  sku: string
  attributes: WooAttribute[]
  variations: number[]
  permalink: string
}

interface WooVariationAttr { id: number; name: string; option: string }

interface WooRestVariation {
  id: number
  price: string
  regular_price: string
  sale_price: string
  stock_status: string
  stock_quantity: number | null
  attributes: WooVariationAttr[]
}

interface WooRestCategory {
  id: number
  name: string
  slug: string
  description: string
  count: number
  image: { src: string; alt: string } | null
}

interface WooRestAttributeTerm {
  id: number
  name: string
  slug: string
}

/* ── Fetch helper ─────────────────────────────────── */

async function wooGet<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`${WP_BASE}/wp-json/wc/v3${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))
  const res = await fetch(url.toString(), {
    headers: { Authorization: auth() },
    next: { revalidate: 3600 },
  })
  if (!res.ok) throw new Error(`WooCommerce REST ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

/* ── Category + attribute slug→ID maps (cached per request) ── */

// WooCommerce REST API requires numeric IDs for category and attribute_term filters.
// These cache functions are memoised per server request via React cache().

const getCategoryMap = cache(async (): Promise<Map<string, number>> => {
  const list = await wooGet<WooRestCategory[]>('/products/categories', {
    per_page: 100,
    hide_empty: 'false',
  })
  return new Map(list.map((c) => [c.slug, c.id]))
})

const getAttributeTermMap = cache(
  async (attributeId: number): Promise<Map<string, number>> => {
    const list = await wooGet<WooRestAttributeTerm[]>(
      `/products/attributes/${attributeId}/terms`,
      { per_page: 100 }
    )
    return new Map(list.map((t) => [t.slug, t.id]))
  }
)

async function resolveCategoryId(slug: string): Promise<number | undefined> {
  const map = await getCategoryMap()
  return map.get(slug)
}

// Known WooCommerce attribute IDs on this site (pa_size = 3)
// Attribute ID for pa_type is looked up dynamically if present.
const ATTR_IDS: Record<string, number> = {
  pa_size: 3,
}

async function resolveTermId(attrSlug: string, termSlug: string): Promise<number | undefined> {
  const attrId = ATTR_IDS[attrSlug]
  if (!attrId) return undefined
  const map = await getAttributeTermMap(attrId)
  return map.get(termSlug)
}

/* ── Price formatter ──────────────────────────────── */

function fmtPrice(raw: string | null | undefined): string {
  if (!raw) return ''
  const num = parseFloat(raw)
  if (isNaN(num)) return ''
  return 'Rs. ' + Math.round(num).toLocaleString('en-PK')
}

function toStockStatus(s: string): string {
  return s === 'instock' ? 'IN_STOCK' : 'OUT_OF_STOCK'
}

// WooCommerce REST API returns display names like "Size", "Type".
// WooGraphQL returns taxonomy slugs like "attribute_pa_size".
// Normalise to WooGraphQL format so ProductActions.findVariation works unchanged.
function toAttrName(displayName: string): string {
  return `attribute_pa_${displayName.toLowerCase().replace(/\s+/g, '_')}`
}

/* ── Normalizers ──────────────────────────────────── */

function toProductNode(p: WooRestProduct): ProductNode {
  return {
    id: `woo-${p.id}`,
    databaseId: p.id,
    slug: p.slug,
    name: p.name,
    type: p.type.toUpperCase(),
    image: p.images?.[0]
      ? { sourceUrl: p.images[0].src, altText: p.images[0].alt ?? '' }
      : null,
    price: fmtPrice(p.price),
    regularPrice: fmtPrice(p.regular_price),
    salePrice: p.sale_price ? fmtPrice(p.sale_price) : null,
    onSale: p.on_sale,
    stockStatus: toStockStatus(p.stock_status),
  }
}

function toProductFull(p: WooRestProduct, vars: WooRestVariation[]): ProductFull {
  const attrs: ProductAttribute[] = (p.attributes ?? []).map((a) => ({
    name: toAttrName(a.name),
    label: a.name,
    options: a.options ?? [],
    variation: a.variation ?? false,
  }))

  const variations: ProductVariation[] = vars.map((v) => ({
    databaseId: v.id,
    price: fmtPrice(v.price),
    regularPrice: fmtPrice(v.regular_price),
    salePrice: v.sale_price ? fmtPrice(v.sale_price) : null,
    stockStatus: toStockStatus(v.stock_status),
    stockQuantity: v.stock_quantity ?? null,
    attributes: {
      nodes: (v.attributes ?? []).map((a) => ({
        name: toAttrName(a.name),
        value: a.option,
      })),
    },
  }))

  const seo: WpSeo = {
    title: p.name,
    metaDesc: (p.short_description ?? '').replace(/<[^>]*>/g, '').slice(0, 160),
    canonical: p.permalink,
  }

  return {
    id: `woo-${p.id}`,
    databaseId: p.id,
    slug: p.slug,
    name: p.name,
    type: p.type.toUpperCase(),
    sku: p.sku ?? '',
    image: p.images?.[0]
      ? { sourceUrl: p.images[0].src, altText: p.images[0].alt ?? '' }
      : null,
    price: fmtPrice(p.price),
    regularPrice: fmtPrice(p.regular_price),
    salePrice: p.sale_price ? fmtPrice(p.sale_price) : null,
    onSale: p.on_sale,
    stockStatus: toStockStatus(p.stock_status),
    description: p.description ?? '',
    shortDescription: p.short_description ?? '',
    galleryImages: {
      nodes: (p.images ?? []).slice(1).map((img) => ({
        sourceUrl: img.src,
        altText: img.alt ?? '',
      })),
    },
    attributes: { nodes: attrs },
    variations: variations.length > 0 ? { nodes: variations } : undefined,
    productCategories: {
      nodes: (p.categories ?? []).map((c) => ({ slug: c.slug, name: c.name })),
    },
    related: { nodes: [] },
    seo,
  }
}

/* ── Public API ───────────────────────────────────── */

export interface WooProductsResult {
  nodes: ProductNode[]
  found: number
  hasNextPage: boolean
}

export interface WooProductFilters {
  first?: number
  page?: number
  category?: string
  onSale?: boolean
  /** "stitched" | "unstitched" — maps to WC attribute pa_type */
  type?: string
  /** "xs" | "s" | "m" | "l" | "xl" | "xxl" — maps to WC attribute pa_size */
  size?: string
  /** "newest" | "price_asc" | "price_desc" | "sale" */
  sort?: string
}

export async function fetchWooProducts(filters: WooProductFilters = {}): Promise<WooProductsResult> {
  const params: Record<string, string> = {
    per_page: String(filters.first ?? 16),
    page: String(filters.page ?? 1),
    status: 'publish',
  }

  // Category: resolve slug → numeric ID (REST API requires the ID)
  if (filters.category) {
    const catId = await resolveCategoryId(filters.category)
    if (catId !== undefined) params.category = String(catId)
    // If slug not found, omit category filter (returns all products)
  }

  if (filters.onSale || filters.sort === 'sale') params.on_sale = 'true'

  // Attribute filtering: size takes priority over type
  if (filters.size) {
    const termId = await resolveTermId('pa_size', filters.size)
    if (termId !== undefined) {
      params.attribute = 'pa_size'
      params.attribute_term = String(termId)
    }
  } else if (filters.type) {
    const termId = await resolveTermId('pa_type', filters.type)
    if (termId !== undefined) {
      params.attribute = 'pa_type'
      params.attribute_term = String(termId)
    }
  }

  // Sort mapping
  switch (filters.sort) {
    case 'price_asc':
      params.orderby = 'price'; params.order = 'asc'; break
    case 'price_desc':
      params.orderby = 'price'; params.order = 'desc'; break
    case 'newest':
      params.orderby = 'date'; params.order = 'desc'; break
  }

  const url = new URL(`${WP_BASE}/wp-json/wc/v3/products`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString(), {
    headers: { Authorization: auth() },
    next: { revalidate: 3600 },
  })

  if (!res.ok) throw new Error(`WooCommerce REST ${res.status}: /products`)

  const total = parseInt(res.headers.get('X-WP-Total') ?? '0', 10)
  const totalPages = parseInt(res.headers.get('X-WP-TotalPages') ?? '1', 10)
  const list: WooRestProduct[] = await res.json()

  return {
    nodes: list.map(toProductNode),
    found: total,
    hasNextPage: (filters.page ?? 1) < totalPages,
  }
}

export async function fetchWooProduct(slug: string): Promise<ProductFull | null> {
  const list = await wooGet<WooRestProduct[]>('/products', { slug, status: 'publish' })
  if (!list.length) return null
  const p = list[0]
  let vars: WooRestVariation[] = []
  if (p.type === 'variable' && p.variations?.length) {
    vars = await wooGet<WooRestVariation[]>(`/products/${p.id}/variations`, { per_page: 100 })
  }
  return toProductFull(p, vars)
}

export async function fetchWooProductSlugs(): Promise<string[]> {
  const list = await wooGet<WooRestProduct[]>('/products', { per_page: 100, status: 'publish' })
  return list.map((p) => p.slug)
}

export async function fetchWooCategory(slug: string): Promise<CategoryData | null> {
  const list = await wooGet<WooRestCategory[]>('/products/categories', { slug })
  if (!list.length) return null
  const c = list[0]
  return {
    id: String(c.id),
    slug: c.slug,
    name: c.name,
    description: c.description ?? '',
    count: c.count,
    image: c.image ? { sourceUrl: c.image.src, altText: c.image.alt ?? '' } : null,
    acfCategoryIntro: null,
    seo: {
      title: c.name,
      metaDesc: (c.description ?? '').replace(/<[^>]*>/g, '').slice(0, 160),
    },
  }
}

export async function fetchWooCategorySlugs(): Promise<string[]> {
  const list = await wooGet<WooRestCategory[]>('/products/categories', {
    per_page: 100,
    hide_empty: 'true',
  })
  return list.map((c) => c.slug)
}

export async function fetchWooRelatedProducts(
  categorySlug: string,
  excludeId: number,
  first = 4
): Promise<ProductNode[]> {
  const result = await fetchWooProducts({ category: categorySlug, first: first + 1 })
  return result.nodes.filter((p) => p.databaseId !== excludeId).slice(0, first)
}
