import { HeroSlider } from './HeroSlider'
import { CategoryTiles } from './CategoryTiles'
import { FeaturedProductTabs } from './FeaturedProductTabs'
import { GiftBanner } from './GiftBanner'
import { OccasionChips } from './OccasionChips'
import { FromAbroad } from './FromAbroad'
import { TrustRow } from './TrustRow'
import type { HomeBlock, OccasionChip } from '@/lib/wp/queries/home'
import { fetchWooOccasionChips, WOO_REST_ENABLED } from '@/lib/woo/rest-client'

interface Props {
  blocks: HomeBlock[]
}

export async function HomeBlockRenderer({ blocks }: Props) {
  // Fetch only the children of the "Occasions" parent category from WooCommerce.
  let wooChips: OccasionChip[] | null = null
  if (blocks.some((b) => b.fieldGroupName === 'occasion_chips') && WOO_REST_ENABLED) {
    try {
      const chips = await fetchWooOccasionChips()
      if (chips.length > 0) wooChips = chips
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
            return (
              <GiftBanner
                key={i}
                content={{
                  heading: block.heading,
                  subtext: block.subtext,
                  ctaLabel: block.ctaLabel,
                  ctaLink: block.ctaLink,
                }}
              />
            )
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
