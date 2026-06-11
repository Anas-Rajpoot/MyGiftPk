import Link from 'next/link'
import { RibbonHeading } from '@/components/ui/RibbonHeading'
import type { OccasionChip } from '@/lib/wp/queries/home'

export function OccasionChips({ chips }: { chips: OccasionChip[] }) {
  return (
    <section aria-labelledby="occasions-heading" className="py-14 sm:py-20 bg-cream">
      <div className="max-w-[1320px] mx-auto px-6">
        <RibbonHeading as="h2" id="occasions-heading" align="center" gold className="text-4xl sm:text-5xl mb-8 sm:mb-10">
          SHOP BY OCCASION
        </RibbonHeading>
        <p className="text-center font-body text-stone text-sm sm:text-base mb-8 max-w-md mx-auto">
          Find the perfect gift for every milestone — curated collections for every occasion.
        </p>
        <div
          role="list"
          className="flex flex-wrap justify-center gap-3"
        >
          {chips.map((chip) => (
            <Link
              key={chip.slug}
              href={`/gifts/${chip.slug}`}
              role="listitem"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-chip border border-hairline bg-ivory font-body text-sm font-medium text-ink hover:border-wine hover:bg-wine-tint hover:text-wine transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2"
            >
              <span aria-hidden>{chip.emoji}</span>
              {chip.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
