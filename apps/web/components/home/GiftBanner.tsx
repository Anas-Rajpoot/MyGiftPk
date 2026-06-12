import Link from 'next/link'
import { Gift, Package, Smile } from 'lucide-react'
import { RibbonHeading } from '@/components/ui/RibbonHeading'
import type { GiftBannerContent } from '@/lib/wp/home-content'

const steps = [
  { Icon: Package, label: 'Choose a box', number: '01' },
  { Icon: Gift, label: 'Fill with goodies', number: '02' },
  { Icon: Smile, label: 'Add your message', number: '03' },
]

const DEFAULTS: GiftBannerContent = {
  heading: "BUILD A GIFT THEY'LL NEVER FORGET",
  subtext: 'Choose a box, fill it with your favourite treats and clothing, add a personal message — we deliver anywhere in Pakistan.',
  ctaLabel: 'Start Building',
  ctaLink: '/gift-builder',
}

export function GiftBanner({ content }: { content?: GiftBannerContent | null }) {
  const { heading, subtext, ctaLabel, ctaLink } = content ?? DEFAULTS
  return (
    <section
      aria-labelledby="gift-banner-heading"
      className="bg-wine py-16 sm:py-24 px-6"
    >
      <div className="max-w-[1320px] mx-auto text-center">
        <RibbonHeading
          as="h2"
          id="gift-banner-heading"
          align="center"
          gold
          className="text-4xl sm:text-6xl"
        >
          {heading}
        </RibbonHeading>

        <p className="mt-6 font-body text-ivory/80 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
          {subtext}
        </p>

        {/* 3-step mini-graphic */}
        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
          {steps.map(({ Icon, label, number }, i) => (
            <div key={number} className="flex flex-row sm:flex-col items-center sm:items-center gap-4 sm:gap-3">
              <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-ivory/10 border border-gold/40 shrink-0">
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 bg-gold text-ink text-[10px] font-body font-semibold rounded-full">
                  {number}
                </span>
                <Icon className="h-6 w-6 text-gold" aria-hidden />
              </div>
              <p className="font-body text-sm font-medium text-ivory/80 sm:text-center">{label}</p>
              {i < steps.length - 1 && (
                <div className="hidden sm:block w-12 h-px bg-gold/30 mx-2" aria-hidden />
              )}
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href={ctaLink}
            className="inline-flex items-center h-12 px-8 bg-gold text-ink rounded-input font-body font-semibold text-[15px] tracking-wide hover:bg-gold/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-wine"
          >
            {ctaLabel} →
          </Link>
        </div>
      </div>
    </section>
  )
}
