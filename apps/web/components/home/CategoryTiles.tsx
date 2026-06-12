import Link from 'next/link'
import Image from 'next/image'
import { RibbonHeading } from '@/components/ui/RibbonHeading'
import type { CategoryTile } from '@/lib/wp/queries/home'

/* Color fills for categories when no image is configured */
const categoryColors: Record<string, string> = {
  women: 'bg-wine-tint',
  men: 'bg-cream',
  kids: 'bg-gold-tint',
  gifts: 'bg-wine-tint',
}

interface CategoryTilesProps {
  tiles: CategoryTile[]
}

export function CategoryTiles({ tiles }: CategoryTilesProps) {
  return (
    <section aria-labelledby="categories-heading" className="py-14 sm:py-24">
      <div className="max-w-[1320px] mx-auto px-6">
        <RibbonHeading as="h2" id="categories-heading" align="center" className="text-4xl sm:text-5xl mb-10 sm:mb-12">
          SHOP BY CATEGORY
        </RibbonHeading>
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 list-none p-0 m-0">
          {tiles.map((tile) => {
            const hasImage = tile.image?.sourceUrl && !tile.image.sourceUrl.startsWith('/placeholder')
            const colorClass = categoryColors[tile.slug] ?? 'bg-cream'
            return (
              <li key={tile.slug}>
                <Link
                  href={tile.link ?? `/category/${tile.slug}`}
                  className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2 rounded-card"
                >
                  <div className={`relative aspect-[3/4] rounded-card overflow-hidden ${colorClass}`}>
                    {hasImage && tile.image ? (
                      <Image
                        src={tile.image.sourceUrl}
                        alt={tile.image.altText}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      /* Placeholder with pattern */
                      <div className="absolute inset-0 flex items-end p-4">
                        <div className="opacity-10 select-none font-display text-6xl uppercase text-wine leading-none">
                          {tile.name}
                        </div>
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" aria-hidden />
                    {/* Label */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="font-display text-2xl sm:text-3xl uppercase text-ivory leading-none group-hover:text-gold transition-colors duration-150">
                        {tile.name}
                      </p>
                      <p className="font-body text-xs text-ivory/70 mt-1 group-hover:text-ivory transition-colors">
                        Shop now →
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
