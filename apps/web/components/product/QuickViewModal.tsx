'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { X, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ProductFull } from '@/lib/wp/queries/shop'
import { ProductGallery } from './ProductGallery'
import { ProductActions } from './ProductActions'

interface QuickViewModalProps {
  product: ProductFull
}

export function QuickViewModal({ product }: QuickViewModalProps) {
  const router = useRouter()
  const actionsRef = useRef<HTMLDivElement>(null)

  function dismiss() {
    router.back()
  }

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-ink/60"
        aria-hidden
        onClick={dismiss}
      />

      <motion.div
        key="modal"
        role="dialog"
        aria-modal
        aria-label={product.name}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 32 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="fixed inset-x-4 bottom-0 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-12 sm:bottom-12 z-50 bg-ivory rounded-t-2xl sm:rounded-card w-full sm:max-w-3xl overflow-hidden flex flex-col max-h-[90dvh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-hairline shrink-0">
          <p className="font-display text-base uppercase tracking-wide text-ink truncate pr-4">
            {product.name}
          </p>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Close quick view"
            className="w-8 h-8 flex items-center justify-center text-stone hover:text-ink transition-colors shrink-0"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 sm:grid sm:grid-cols-2 sm:gap-6">
            <ProductGallery
              mainImage={product.image}
              gallery={product.galleryImages?.nodes ?? []}
              productName={product.name}
            />
            <div ref={actionsRef}>
              <ProductActions product={product} />
            </div>
          </div>
        </div>

        {/* Footer: link to full PDP */}
        <div className="shrink-0 px-5 py-3 border-t border-hairline">
          <Link
            href={`/product/${product.slug}`}
            className="flex items-center justify-center gap-1.5 text-sm font-body text-stone hover:text-wine transition-colors"
          >
            View full product details
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
