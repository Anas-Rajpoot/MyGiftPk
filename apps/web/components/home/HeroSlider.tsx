'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { clsx } from 'clsx'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { RibbonHeading } from '@/components/ui/RibbonHeading'
import { Button } from '@/components/ui/Button'
import type { HeroSlide } from '@/lib/wp/queries/home'

// ── Add more images here to extend the hero slideshow ──────────────────────────
// objectPosition controls the focal crop on mobile (4:3) and desktop (21:9).
const LOCAL_BG_IMAGES = [
  {
    src: '/hero-bg.png',
    alt: 'MYGIFT hero background',
    mobileObjectPosition: 'center 40%',
    desktopObjectPosition: 'center center',
  },
  {
    src: '/hero-bg-2.png',
    alt: 'MYGIFT hero background',
    mobileObjectPosition: 'center 40%',
    desktopObjectPosition: 'center center',
  },
] as const

const SLIDE_INTERVAL = 5000
// Ken Burns duration slightly longer than SLIDE_INTERVAL so motion never "snaps back"
const KB_DURATION = SLIDE_INTERVAL / 1000 + 2

interface HeroSliderProps {
  slides: HeroSlide[]
}

// Cross-fade between slides (premium vs basic x-translate)
const slideVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
}

export function HeroSlider({ slides }: HeroSliderProps) {
  const slideCount = LOCAL_BG_IMAGES.length
  const [active, setActive] = useState(0)
  const prefersReducedMotion = useReducedMotion()

  const go = useCallback((next: number) => {
    setActive(next)
  }, [])

  const prev = useCallback(() => {
    go((active - 1 + slideCount) % slideCount)
  }, [active, slideCount, go])

  const next = useCallback(() => {
    go((active + 1) % slideCount)
  }, [active, slideCount, go])

  useEffect(() => {
    if (prefersReducedMotion || slideCount <= 1) return
    const id = setInterval(next, SLIDE_INTERVAL)
    return () => clearInterval(id)
  }, [next, prefersReducedMotion, slideCount])

  const slide = slides[active % Math.max(slides.length, 1)]
  const bgImage = LOCAL_BG_IMAGES[active]

  const hasWpImage =
    slide?.desktopImage?.sourceUrl &&
    !slide.desktopImage.sourceUrl.startsWith('/placeholder')

  return (
    <section
      aria-label="Hero banner"
      className="relative overflow-hidden bg-ink"
    >
      {/* Responsive aspect: portrait on mobile, cinematic on desktop */}
      <div className="aspect-[4/3] xs:aspect-[16/9] sm:aspect-[21/9]">

        {/* ── Slides ──────────────────────────────────────────────────────── */}
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={active}
            variants={prefersReducedMotion ? undefined : slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.85, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            {/* Ken Burns wrapper — re-keyed so the slow zoom restarts per slide */}
            <motion.div
              key={`kb-${active}`}
              initial={prefersReducedMotion ? false : { scale: 1.07 }}
              animate={{ scale: 1.0 }}
              transition={{ duration: KB_DURATION, ease: 'linear' }}
              className="absolute inset-0"
            >
              {/* Mobile bg */}
              <Image
                src={bgImage.src}
                alt={bgImage.alt}
                fill
                sizes="100vw"
                className="object-cover sm:hidden"
                style={{ objectPosition: bgImage.mobileObjectPosition }}
                priority={active === 0}
                aria-hidden
              />
              {/* Desktop bg */}
              <Image
                src={bgImage.src}
                alt={bgImage.alt}
                fill
                sizes="100vw"
                className="object-cover hidden sm:block"
                style={{ objectPosition: bgImage.desktopObjectPosition }}
                priority={active === 0}
                aria-hidden
              />

              {/* WP images override local bg when real images are configured */}
              {hasWpImage && (
                <>
                  <Image
                    src={slide.desktopImage.sourceUrl}
                    alt={slide.desktopImage.altText}
                    fill
                    sizes="100vw"
                    className="object-cover hidden sm:block"
                    priority={active === 0}
                  />
                  {slide.mobileImage?.sourceUrl && (
                    <Image
                      src={slide.mobileImage.sourceUrl}
                      alt={slide.mobileImage.altText}
                      fill
                      sizes="100vw"
                      className="object-cover sm:hidden"
                      priority={active === 0}
                    />
                  )}
                </>
              )}
            </motion.div>

            {/* Gradient — heavier on left to frame the text panel */}
            <div
              className="absolute inset-0"
              style={{
                background: [
                  'linear-gradient(to right, rgba(31,26,23,0.90) 0%, rgba(31,26,23,0.60) 42%, rgba(31,26,23,0.18) 72%, transparent 100%)',
                  'linear-gradient(to top, rgba(31,26,23,0.50) 0%, transparent 38%)',
                ].join(', '),
              }}
              aria-hidden
            />

            {/* ── Text block — vertically centred, left side ──────────────── */}
            {slide && (
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-[1320px] w-full mx-auto px-6 sm:px-10 lg:px-16">
                  <div className="max-w-[420px] sm:max-w-[480px] lg:max-w-[560px]">

                    {/* Accent rule + label */}
                    <motion.div
                      initial={prefersReducedMotion ? false : { opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                      className="flex items-center gap-3 mb-4 sm:mb-5"
                    >
                      <span className="block h-px w-8 sm:w-10 bg-gold shrink-0" />
                      <span
                        className="font-body text-gold text-[10px] sm:text-[11px] tracking-[0.22em] uppercase font-semibold"
                        style={{ textShadow: '0 1px 6px rgba(31,26,23,0.6)' }}
                      >
                        Premium Gifting
                      </span>
                    </motion.div>

                    {/* Main heading */}
                    <motion.div
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 22 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.38, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                      style={{ filter: 'drop-shadow(0 3px 18px rgba(31,26,23,0.55))' }}
                    >
                      <RibbonHeading
                        as="h1"
                        align="left"
                        inverted
                        className="text-[44px] leading-none sm:text-[64px] lg:text-[80px] xl:text-[96px]"
                      >
                        {slide.heading}
                      </RibbonHeading>
                    </motion.div>

                    {/* Subtext */}
                    <motion.p
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.50, duration: 0.60, ease: [0.22, 1, 0.36, 1] }}
                      className="mt-4 sm:mt-5 font-body text-ivory/90 text-sm sm:text-[15px] lg:text-base max-w-[360px] sm:max-w-[400px] leading-relaxed"
                      style={{ textShadow: '0 1px 10px rgba(31,26,23,0.65)' }}
                    >
                      {slide.subtext}
                    </motion.p>

                    {/* CTA */}
                    <motion.div
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.62, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                      className="mt-6 sm:mt-8"
                    >
                      <Button as="link" href={slide.ctaLink} size="lg">
                        {slide.ctaLabel} →
                      </Button>
                    </motion.div>

                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Prev / Next arrows ──────────────────────────────────────────── */}
        {slideCount > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous slide"
              onClick={prev}
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-ink/30 hover:bg-ink/55 text-ivory rounded-full transition-colors backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={next}
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-ink/30 hover:bg-ink/55 text-ivory rounded-full transition-colors backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </>
        )}

        {/* ── Dot indicators ──────────────────────────────────────────────── */}
        {slideCount > 1 && (
          <div
            role="tablist"
            aria-label="Slide indicators"
            className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2"
          >
            {LOCAL_BG_IMAGES.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-label={`Go to slide ${i + 1}`}
                aria-selected={i === active}
                onClick={() => go(i)}
                className={clsx(
                  'rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory',
                  i === active
                    ? 'bg-gold w-6 h-2'
                    : 'bg-ivory/40 hover:bg-ivory/70 w-2 h-2'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
