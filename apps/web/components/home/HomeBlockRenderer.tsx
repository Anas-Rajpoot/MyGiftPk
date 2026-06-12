import { HeroSlider } from './HeroSlider'
import { CategoryTiles } from './CategoryTiles'
import { FeaturedProductTabs } from './FeaturedProductTabs'
import { GiftBanner } from './GiftBanner'
import { OccasionChips } from './OccasionChips'
import { FromAbroad } from './FromAbroad'
import { TrustRow } from './TrustRow'
import type { HomeBlock, OccasionChip } from '@/lib/wp/queries/home'
import { fetchWooAllCategories, WOO_REST_ENABLED } from '@/lib/woo/rest-client'

export async function HomeBlockRenderer({ blocks }: { blocks: HomeBlock[] }) {
  // Fetch live WooCommerce categories for the occasion chips block (hide_empty=true
  // so only categories with at least one published product are shown)
  let wooChips: OccasionChip[] | null = null
  if (blocks.some((b) => b.fieldGroupName === 'occasion_chips') && WOO_REST_ENABLED) {
    try {
      const cats = await fetchWooAllCategories(true)
      if (cats.length > 0) {
        wooChips = cats.map((cat) => ({ label: cat.name, slug: cat.slug }))
      }
    } catch {
      // fall back to fixture chips below
    }
  }

  return (
    <>
      {blocks.map((block, i) => {
        switch (block.fieldGroupName) {
          case 'hero_slider':
            return <HeroSlider key={i} slides={block.slides} />
          case 'category_tiles':
            return <CategoryTiles key={i} tiles={block.tiles} />
          case 'featured_tabs':
            return <FeaturedProductTabs key={i} tabs={block.tabs} />
          case 'gift_banner':
            return <GiftBanner key={i} />
          case 'occasion_chips':
            return <OccasionChips key={i} chips={wooChips ?? block.chips} />
          case 'from_abroad_block':
            return (
              <FromAbroad
                key={i}
                data={{
                  heading: block.heading,
                  subtext: block.subtext,
                  image: block.image ?? null,
                  ctaLabel: block.ctaLabel,
                  ctaLink: block.ctaLink,
                }}
              />
            )
          case 'trust_row':
            return <TrustRow key={i} items={block.items} />
          default:
            return null
        }
      })}
    </>
  )
}
