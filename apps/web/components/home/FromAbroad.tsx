import Link from 'next/link'
import Image from 'next/image'
import { Plane } from 'lucide-react'
import { RibbonHeading } from '@/components/ui/RibbonHeading'
import type { FromAbroadData } from '@/lib/wp/queries/home'

function isPlaceholder(url: string | null | undefined) {
  return !url || url.startsWith('/placeholder')
}

export function FromAbroad({ data }: { data: FromAbroadData }) {
  const noImage = isPlaceholder(data.image?.sourceUrl)

  return (
    <section
      aria-labelledby="from-abroad-heading"
      className="py-14 sm:py-24"
    >
      <div className="max-w-[1320px] mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-10 sm:gap-16 items-center">

          {/* Text */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-wine-tint">
                <Plane className="h-5 w-5 text-wine" aria-hidden />
              </div>
              <span className="font-body text-sm font-medium text-stone uppercase tracking-widest">
                Sending from abroad
              </span>
            </div>
            <RibbonHeading
              as="h2"
              id="from-abroad-heading"
              align="left"
              className="text-4xl sm:text-5xl"
            >
              {data.heading}
            </RibbonHeading>
            <p className="mt-5 font-body text-base text-stone leading-relaxed max-w-md">
              {data.subtext}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href={data.ctaLink}
                className="inline-flex items-center h-12 px-6 bg-wine text-ivory rounded-input font-body font-semibold text-[15px] tracking-wide hover:bg-wine-deep transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2"
              >
                {data.ctaLabel} →
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center h-12 px-6 text-wine border border-wine rounded-input font-body font-semibold text-[15px] tracking-wide hover:bg-wine-tint transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2"
              >
                Browse All
              </Link>
            </div>
          </div>

          {/* Image / Placeholder */}
          <div className="relative aspect-[4/3] rounded-card overflow-hidden bg-wine-tint">
            {!noImage && data.image ? (
              <Image
                src={data.image.sourceUrl}
                alt={data.image.altText}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              /* Decorative placeholder */
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center bg-gradient-to-br from-wine-tint to-cream">
                <Plane className="h-12 w-12 text-wine opacity-30" aria-hidden />
                <p className="font-display text-3xl uppercase text-wine opacity-40 leading-none">
                  FROM ABROAD<br />TO PAKISTAN
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
