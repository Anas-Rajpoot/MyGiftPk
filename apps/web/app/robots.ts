import type { MetadataRoute } from 'next'
import { BASE_URL as BASE } from '@/lib/config/site'

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
