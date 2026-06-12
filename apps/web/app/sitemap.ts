import type { MetadataRoute } from 'next'
import {
  fetchWooProductSlugs,
  fetchWooCategorySlugs,
  WOO_REST_ENABLED,
} from '@/lib/woo/rest-client'
import { fetchGraphQL } from '@/lib/wp/client'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mygift.pk'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Static pages
  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/shop`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/gifts`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/gift-builder`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ]

  let productSlugs: string[] = []
  let categorySlugs: string[] = []

  if (WOO_REST_ENABLED) {
    try {
      ;[productSlugs, categorySlugs] = await Promise.all([
        fetchWooProductSlugs(),
        fetchWooCategorySlugs(),
      ])
    } catch {
      // Serve static-only sitemap if WooCommerce is unreachable
    }
  } else {
    // MOCK_MODE fallback: pull slugs from GraphQL fixtures
    try {
      const [pData, cData] = await Promise.all([
        fetchGraphQL<{ products: { nodes: { slug: string }[] } }>(
          `query { products(first:200) { nodes { slug } } }`,
          {},
          { revalidate: 3600 }
        ),
        fetchGraphQL<{ productCategories: { nodes: { slug: string }[] } }>(
          `query { productCategories(first:50) { nodes { slug } } }`,
          {},
          { revalidate: 3600 }
        ),
      ])
      productSlugs = (pData.products?.nodes ?? []).map((n) => n.slug)
      categorySlugs = (cData.productCategories?.nodes ?? []).map((n) => n.slug)
    } catch {
      // leave empty — static URLs still served
    }
  }

  const productUrls: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
    url: `${BASE}/product/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const categoryUrls: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
    url: `${BASE}/category/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticUrls, ...categoryUrls, ...productUrls]
}
