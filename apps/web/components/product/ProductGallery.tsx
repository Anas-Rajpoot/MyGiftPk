'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ZoomIn } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { clsx } from 'clsx'
import type { WpImage } from '@/lib/wp/queries/home'

interface ProductGalleryProps {
  mainImage: WpImage | null
  gallery: WpImage[]
  productName: string
}

const PLACEHOLDER_GRADIENT = 'from-wine-tint via-cream to-ivory'

export function ProductGallery({ mainImage, gallery, productName }: ProductGalleryProps) {
  const images = [mainImage, ...gallery].filter((img): img is WpImage => img !== null)
  const [active, setActive] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)

  const current = images[active]
  const isPlaceholder = !current

  return (
    <>
      <div className="flex gap-3">
        {/* Vertical thumbnails — hidden on mobile */}
        {images.length > 1 && (
          <div className="hidden sm:flex flex-col gap-2 w-16 shrink-0">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1}`}
                className={clsx(
                  'relative aspect-square w-full rounded border overflow-hidden transition-colors',
                  i === active ? 'border-wine' : 'border-hairline hover:border-stone'
                )}
              >
                <Image
                  src={img.sourceUrl}
                  alt={img.altText || `${productName} thumbnail ${i + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div className="flex-1 min-w-0">
          <div className="relative aspect-[3/4] w-full rounded-card overflow-hidden bg-cream group">
            {isPlaceholder ? (
              <div className={clsx('absolute inset-0 bg-gradient-to-br', PLACEHOLDER_GRADIENT)} />
            ) : (
              <Image
                src={current.sourceUrl}
                alt={current.altText || productName}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                priority
              />
            )}

            {/* Zoom trigger */}
            {!isPlaceholder && (
              <button
                type="button"
                onClick={() => setZoomOpen(true)}
                aria-label="Zoom image"
                className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-ivory/80 hover:bg-ivory rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus-visible:opacity-100"
              >
                <ZoomIn className="h-4 w-4 text-ink" aria-hidden />
              </button>
            )}
          </div>

          {/* Mobile dot indicators */}
          {images.length > 1 && (
            <div className="sm:hidden flex justify-center gap-1.5 mt-3">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Image ${i + 1}`}
                  className={clsx(
                    'rounded-full transition-all duration-200',
                    i === active ? 'w-5 h-1.5 bg-wine' : 'w-1.5 h-1.5 bg-hairline'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Zoom modal */}
      <AnimatePresence>
        {zoomOpen && current && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-ink/80"
              aria-hidden
              onClick={() => setZoomOpen(false)}
            />
            <motion.div
              key="zoom"
              role="dialog"
              aria-modal
              aria-label="Zoomed product image"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-4 sm:inset-12 z-50 flex items-center justify-center"
              onClick={() => setZoomOpen(false)}
            >
              <div className="relative w-full h-full max-w-2xl mx-auto">
                <Image
                  src={current.sourceUrl}
                  alt={current.altText || productName}
                  fill
                  sizes="(max-width: 640px) 100vw, 672px"
                  className="object-contain"
                />
              </div>
              <button
                type="button"
                onClick={() => setZoomOpen(false)}
                aria-label="Close zoom"
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-ivory/20 hover:bg-ivory/40 text-ivory rounded-full transition-colors"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
