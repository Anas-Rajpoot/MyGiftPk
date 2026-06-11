'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { clsx } from 'clsx'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { RibbonHeading } from '@/components/ui/RibbonHeading'
import { Button } from '@/components/ui/Button'
import type { HeroSlide } from '@/lib/wp/queries/home'

interface HeroSliderProps {
  slides: HeroSlide[]
}

const SLIDE_INTERVAL = 5000

const gradients = [
  'from-wine-deep via-wine to-wine/80',
  'from-ink via-wine-deep to-wine',
  'from-wine via-wine-deep to-ink',
]

function isPlaceholder(url: string | undefined) {
  return !url || url.startsWith('/placeholder')
}

export function HeroSlider({ slides }: HeroSliderProps) {
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState(1)
  const prefersReducedMotion = useReducedMotion()

  const go = useCallback((next: number, dir: number) => {
    setDirection(dir)
    setActive(next)
  }, [])

  const prev = useCallback(() => {
    go((active - 1 + slides.length) % slides.length, -1)
  }, [active, slides.length, go])

  const next = useCallback(() => {
    go((active + 1) % slides.length, 1)
  }, [active, slides.length, go])

  useEffect(() => {
    if (prefersReducedMotion || slides.length <= 1) return
    const id = setInterval(next, SLIDE_INTERVAL)
    return () => clearInterval(id)
  }, [next, prefersReducedMotion, slides.length])

  const slide = slides[active]
  const usePlaceholder = isPlaceholder(slide.desktopImage?.sourceUrl)

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? '8%' : '-8%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? '-8%' : '8%', opacity: 0 }),
  }

  return (
    <section
      aria-label="Hero banner"
      className="relative overflow-hidden aspect-[4/5] sm:aspect-[21/9] bg-ink"
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={active}
          custom={direction}
          variants={prefersReducedMotion ? undefined : variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* Background */}
          {usePlaceholder ? (
            <div className={clsx('absolute inset-0 bg-gradient-to-br', gradients[active % gradients.length])} />
          ) : (
            <>
              <Image
                src={slide.desktopImage.sourceUrl}
                alt={slide.desktopImage.altText}
                fill
                sizes="100vw"
                className="object-cover hidden sm:block"
                priority={active === 0}
              />
              <Image
                src={slide.mobileImage.sourceUrl}
                alt={slide.mobileImage.altText}
                fill
                sizes="100vw"
                className="object-cover sm:hidden"
                priority={active === 0}
              />
            </>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-ink/50" aria-hidden />

          {/* Text */}
          <div className="relative z-10 flex flex-col justify-end h-full max-w-[1320px] mx-auto px-6 pb-14 sm:pb-16">
            <RibbonHeading
              as="h1"
              align="left"
              inverted
              className="text-[44px] sm:text-7xl max-w-xl"
            >
              {slide.heading}
            </RibbonHeading>
            <p className="mt-4 font-body text-ivory/80 text-base sm:text-lg max-w-md leading-relaxed">
              {slide.subtext}
            </p>
            <div className="mt-6 sm:mt-8">
              <Button as="link" href={slide.ctaLink} size="lg">
                {slide.ctaLabel} →
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next arrows — desktop only */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={prev}
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center bg-ivory/20 hover:bg-ivory/40 text-ivory rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={next}
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center bg-ivory/20 hover:bg-ivory/40 text-ivory rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div
          role="tablist"
          aria-label="Slide indicators"
          className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2"
        >
          {slides.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-label={`Go to slide ${i + 1}`}
              aria-selected={i === active}
              onClick={() => go(i, i > active ? 1 : -1)}
              className={clsx(
                'rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ivory',
                i === active
                  ? 'bg-ivory w-6 h-2'
                  : 'bg-ivory/40 hover:bg-ivory/60 w-2 h-2'
              )}
            />
          ))}
        </div>
      )}
    </section>
  )
}
