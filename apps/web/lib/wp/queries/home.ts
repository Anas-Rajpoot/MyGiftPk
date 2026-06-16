/**
 * Home-page SEO only. Homepage *content* (blocks) now comes from the native
 * mygift-core REST endpoint via lib/wp/home-content.ts — not ACF/GraphQL.
 * Yoast SEO for the "/" page is still read over GraphQL.
 */
export const GET_HOME_SEO = `
  query GetHomeSeo {
    page(id: "/", idType: URI) {
      seo {
        title
        metaDesc
        canonical
        opengraphTitle
        opengraphDescription
        opengraphImage {
          sourceUrl
        }
      }
    }
  }
`

export interface WpImage {
  sourceUrl: string
  altText: string
}

export interface HeroSlide {
  desktopImage: WpImage
  mobileImage: WpImage
  heading: string
  subtext: string
  ctaLabel: string
  ctaLink: string
}

export interface CategoryTile {
  slug: string
  name: string
  image: WpImage | null
  link?: string
}

export interface FeaturedTab {
  id: string
  title: string
  categorySlug: string
}

export interface OccasionChip {
  label: string
  slug: string
}

export interface TrustItem {
  icon: string
  heading: string
  subtext: string
}

export interface FromAbroadData {
  heading: string
  subtext: string
  image: WpImage | null
  ctaLabel: string
  ctaLink: string
}

export interface GiftBannerBlockData {
  heading: string
  subtext: string
  ctaLabel: string
  ctaLink: string
}

export type HomeBlock =
  | { fieldGroupName: 'hero_slider'; slides: HeroSlide[] }
  | { fieldGroupName: 'category_tiles'; tiles: CategoryTile[] }
  | { fieldGroupName: 'featured_tabs'; tabs: FeaturedTab[] }
  | ({ fieldGroupName: 'gift_banner' } & GiftBannerBlockData)
  | { fieldGroupName: 'occasion_chips'; chips: OccasionChip[] }
  | ({ fieldGroupName: 'from_abroad_block' } & FromAbroadData)
  | { fieldGroupName: 'trust_row'; items: TrustItem[] }

export interface HomePageSeo {
  title: string
  metaDesc: string
  canonical?: string
  opengraphTitle?: string
  opengraphDescription?: string
  opengraphImage?: WpImage | null
}

export interface HomePageData {
  page: {
    seo: HomePageSeo
  } | null
}
