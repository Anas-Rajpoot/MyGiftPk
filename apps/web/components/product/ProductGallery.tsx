'use client'

import { useState } from 'react'
import Image from 'next/image'
import { clsx } from 'clsx'
import { Expand } from 'lucide-react'
import type { WpImage } from '@/lib/wp/queries/home'
import { Lightbox } from './Lightbox'

interface ProductGalleryProps {
  mainImage: WpImage | null
  gallery: WpImage[]
  productName: string
  /** compact=true: used inside QuickView modal — full-width image, no thumbnail sidebar */
  compact?: boolean
}

export function ProductGallery({ mainImage, gallery, productName, compact = false }: ProductGalleryProps) {
  const images = [mainImage, ...gallery].filter((img): img is WpImage => img !== null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxStart, setLightboxStart] = useState(0)

  function openLightbox(i = activeIndex) {
    setLightboxStart(i)
    setLightboxOpen(true)
  }

  const current = images[activeIndex]

  // ── COMPACT (QuickView modal) ──────────────────────────────────────────────
  // No thumbnail sidebar. Full-width image fills the panel. Click → lightbox.
  if (compact) {
    return (
      <>
        <div className="flex flex-col h-full gap-2">
          {/* Main image — fills available height */}
          <button
            type="button"
            onClick={() => openLightbox(activeIndex)}
            aria-label="View full image"
            className="relative flex-1 min-h-0 w-full rounded-card overflow-hidden bg-cream group cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine"
          >
            {current ? (
              <Image
                src={current.sourceUrl}
                alt={current.altText || productName}
                fill
                sizes="(max-width: 640px) 100vw, 55vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-wine-tint via-cream to-ivory" />
            )}
            {/* Expand hint */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-ink/50 text-ivory rounded-full px-2.5 py-1 text-[11px] font-body opacity-0 group-hover:opacity-100 transition-opacity">
              <Expand className="h-3 w-3" aria-hidden />
              View gallery
            </div>
          </button>

          {/* Dot / thumbnail strip — compact */}
          {images.length > 1 && (
            <div className="flex gap-1.5 justify-center py-1 shrink-0">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Image ${i + 1}`}
                  className={clsx(
                    'relative overflow-hidden rounded transition-all duration-200 shrink-0',
                    i === activeIndex
                      ? 'w-10 h-1.5 bg-wine'
                      : 'w-8 h-8 rounded-input ring-1 ring-hairline hover:ring-stone'
                  )}
                >
                  {i !== activeIndex && (
                    <Image
                      src={img.sourceUrl}
                      alt=""
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <Lightbox
          images={images}
          initialIndex={lightboxStart}
          productName={productName}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      </>
    )
  }

  // ── FULL (Single product page) ────────────────────────────────────────────
  // Vertical thumbnail sidebar on the left, large main image on the right.
  return (
    <>
      <div className="flex gap-3 sm:gap-4">
        {/* Vertical thumbnails — hidden on mobile */}
        {images.length > 1 && (
          <div
            className={clsx(
              'hidden sm:flex flex-col gap-2.5 w-[76px] shrink-0',
              'max-h-[420px] overflow-y-auto',
              '[&::-webkit-scrollbar]:w-[3px]',
              '[&::-webkit-scrollbar-track]:bg-transparent',
              '[&::-webkit-scrollbar-thumb]:bg-hairline',
              '[&::-webkit-scrollbar-thumb]:rounded-full',
            )}
          >
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`View image ${i + 1}`}
                className={clsx(
                  'relative aspect-square w-full shrink-0 rounded-input overflow-hidden transition-all duration-150',
                  i === activeIndex
                    ? 'ring-2 ring-wine ring-offset-1'
                    : 'ring-1 ring-hairline hover:ring-wine/50'
                )}
              >
                <Image
                  src={img.sourceUrl}
                  alt={img.altText || `${productName} ${i + 1}`}
                  fill
                  sizes="76px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={() => openLightbox(activeIndex)}
            aria-label="Enlarge image"
            className="relative aspect-[3/4] w-full rounded-card overflow-hidden bg-cream group cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine block"
          >
            {current ? (
              <Image
                src={current.sourceUrl}
                alt={current.altText || productName}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-wine-tint via-cream to-ivory" />
            )}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-ink/50 text-ivory rounded-full px-2.5 py-1 text-[11px] font-body opacity-0 group-hover:opacity-100 transition-opacity">
              <Expand className="h-3 w-3" aria-hidden />
              {images.length > 1 ? `${images.length} photos` : 'Enlarge'}
            </div>
          </button>

          {/* Mobile dots */}
          {images.length > 1 && (
            <div className="sm:hidden flex justify-center gap-1.5 mt-3">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Image ${i + 1}`}
                  className={clsx(
                    'rounded-full transition-all duration-200',
                    i === activeIndex ? 'w-5 h-1.5 bg-wine' : 'w-1.5 h-1.5 bg-hairline'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Lightbox
        images={images}
        initialIndex={lightboxStart}
        productName={productName}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  )
}
