import { HeroSlider } from './HeroSlider'
import { CategoryTiles } from './CategoryTiles'
import { FeaturedProductTabs } from './FeaturedProductTabs'
import { GiftBanner } from './GiftBanner'
import { OccasionChips } from './OccasionChips'
import { FromAbroad } from './FromAbroad'
import { TrustRow } from './TrustRow'
import type { HomeBlock } from '@/lib/wp/queries/home'

export async function HomeBlockRenderer({ blocks }: { blocks: HomeBlock[] }) {
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
            return <OccasionChips key={i} chips={block.chips} />
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
