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
    // Footer pages
    { url: `${BASE}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/faqs`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/size-guide`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/shipping-policy`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/returns`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/careers`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/privacy-policy`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/track-order`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ]

  let productSlugs: string[] = []
  let categorySlugs: string[] = []
  let blogSlugs: string[] = []

  // Blog posts are GraphQL-sourced regardless of WOO_REST mode
  try {
    const bData = await fetchGraphQL<{ posts: { nodes: { slug: string }[] } }>(
      `query { posts(first:200) { nodes { slug } } }`,
      {},
      { tags: ['blog-posts'], revalidate: 3600 }
    )
    blogSlugs = (bData.posts?.nodes ?? []).map((n) => n.slug)
  } catch {
    // leave empty — rest of sitemap still served
  }

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

  const blogUrls: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${BASE}/blog/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }))

  return [...staticUrls, ...categoryUrls, ...productUrls, ...blogUrls]
}
