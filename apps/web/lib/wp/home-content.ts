import type { HeroSlide } from '@/lib/wp/queries/home'
import type { AnnouncementBarData } from '@/lib/wp/queries/global'

export interface GiftBannerContent {
  heading: string
  subtext: string
  ctaLabel: string
  ctaLink: string
}

export interface HomeContent {
  announcementBar: AnnouncementBarData
  heroSlides: HeroSlide[]
  giftBanner: GiftBannerContent
}

function getWpBaseUrl(): string | null {
  // Derive WP base URL from WP_GRAPHQL_URL (strips /graphql path)
  const graphqlUrl = process.env.WP_GRAPHQL_URL
  if (!graphqlUrl) return null
  try {
    return new URL(graphqlUrl).origin
  } catch {
    return null
  }
}

/**
 * Fetch home content from the mygift-core REST endpoint.
 * Returns null when WP_GRAPHQL_URL is not set or the request fails —
 * callers fall back to fixture defaults.
 */
export async function fetchHomeContent(): Promise<HomeContent | null> {
  const base = getWpBaseUrl()
  if (!base) return null

  try {
    const res = await fetch(`${base}/wp-json/mygift/v1/home-content`, {
      next: { revalidate: 3600, tags: ['home', 'global'] },
    })
    if (!res.ok) return null
    return (await res.json()) as HomeContent
  } catch {
    return null
  }
}
