import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mygift.pk'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/account/',
          '/cart',
          '/checkout',
          '/wishlist',
          '/order-confirmation',
          '/styleguide',
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
