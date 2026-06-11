export const GET_HOME_PAGE = `
  query GetHomePage {
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
      homepageBuilder {
        blocks {
          fieldGroupName
          ... on Page_Homepagebuilder_Blocks_HeroSlider {
            slides {
              desktopImage { sourceUrl altText }
              mobileImage  { sourceUrl altText }
              heading
              subtext
              ctaLabel
              ctaLink
            }
          }
          ... on Page_Homepagebuilder_Blocks_CategoryTiles {
            tiles {
              slug
              name
              image { sourceUrl altText }
            }
          }
          ... on Page_Homepagebuilder_Blocks_FeaturedTabs {
            tabs {
              id
              title
              categorySlug
            }
          }
          ... on Page_Homepagebuilder_Blocks_OccasionChips {
            chips {
              label
              slug
              emoji
            }
          }
          ... on Page_Homepagebuilder_Blocks_FromAbroadBlock {
            heading
            subtext
            image { sourceUrl altText }
            ctaLabel
            ctaLink
          }
          ... on Page_Homepagebuilder_Blocks_TrustRow {
            items {
              icon
              heading
              subtext
            }
          }
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
}

export interface FeaturedTab {
  id: string
  title: string
  categorySlug: string
}

export interface OccasionChip {
  label: string
  slug: string
  emoji: string
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

export type HomeBlock =
  | { fieldGroupName: 'hero_slider'; slides: HeroSlide[] }
  | { fieldGroupName: 'category_tiles'; tiles: CategoryTile[] }
  | { fieldGroupName: 'featured_tabs'; tabs: FeaturedTab[] }
  | { fieldGroupName: 'gift_banner' }
  | { fieldGroupName: 'occasion_chips'; chips: OccasionChip[] }
  | { fieldGroupName: 'from_abroad_block' } & FromAbroadData
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
    homepageBuilder: {
      blocks: HomeBlock[]
    }
  }
}
