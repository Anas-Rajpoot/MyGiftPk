'use client'

import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, ArrowUpRight, Truck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import type { ProductFull } from '@/lib/wp/queries/shop'
import { ProductGallery } from './ProductGallery'
import { ProductActions } from './ProductActions'
import { SizeGuideModal } from './SizeGuideModal'

interface QuickViewModalProps {
  product: ProductFull
}

const SIZE_GUIDE_SLUGS = ['women', 'men', 'kids', 'clothing', 'shoes', 'footwear', 'unstitched', 'stitched']

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function QuickViewModal({ product }: QuickViewModalProps) {
  const router = useRouter()
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)

  function dismiss() {
    router.back()
  }

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (sizeGuideOpen) { setSizeGuideOpen(false); return }
        dismiss()
        return
      }
      // Focus trap — keep Tab focus inside the dialog (skip while size guide is open)
      if (e.key === 'Tab' && !sizeGuideOpen && panelRef.current) {
        const items = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
        if (items.length === 0) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizeGuideOpen])

  const categorySlug = product.productCategories?.nodes?.[0]?.slug ?? ''
  const categoryName = product.productCategories?.nodes?.[0]?.name ?? ''
  const showSizeGuide = product.type === 'VARIABLE' ||
    SIZE_GUIDE_SLUGS.some((s) => categorySlug.toLowerCase().includes(s))

  return (
    <>
      <AnimatePresence>
        {/* Backdrop */}
        <motion.div
          key="qv-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 bg-ink/65 backdrop-blur-[3px]"
          aria-hidden
          onClick={dismiss}
        />

        {/* Modal */}
        <motion.div
          key="qv-modal"
          ref={panelRef}
          role="dialog"
          aria-modal
          aria-label={product.name}
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 28, scale: 0.98 }}
          transition={{ type: 'spring', damping: 30, stiffness: 280 }}
          className="fixed inset-x-0 bottom-0 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-5 sm:bottom-5 z-50 w-full sm:max-w-[940px] bg-cream sm:rounded-2xl overflow-hidden flex flex-col shadow-[0_32px_80px_rgba(31,26,23,0.32)]"
          style={{ maxHeight: 'min(95dvh, 820px)' }}
        >
          {/* ── Body: left gallery (60%) + right info (40%) ── */}
          <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">

            {/* Left — gallery (ivory bg, no thumbnail sidebar, image fills panel) */}
            <div className="sm:w-[50%] shrink-0 bg-ivory flex flex-col" style={{ minHeight: '260px' }}>
              <div className="flex-1 min-h-0 p-0">
                <ProductGallery
                  mainImage={product.image}
                  gallery={product.galleryImages?.nodes ?? []}
                  productName={product.name}
                  compact
                />
              </div>
            </div>

            {/* Right — product info (cream bg) */}
            <div
              className={clsx(
                'flex-1 flex flex-col overflow-y-auto bg-cream',
                '[&::-webkit-scrollbar]:w-[3px]',
                '[&::-webkit-scrollbar-track]:bg-transparent',
                '[&::-webkit-scrollbar-thumb]:bg-hairline',
                '[&::-webkit-scrollbar-thumb]:rounded-full',
              )}
            >
              <div className="p-5 sm:p-6 flex flex-col gap-4">

                {/* Category crumb */}
                {categoryName && (
                  <p className="font-body text-[11px] uppercase tracking-[0.2em] text-stone">
                    {categoryName}
                  </p>
                )}

                {/* Product name */}
                <div>
                  <h2 className="font-display text-[22px] sm:text-[26px] uppercase tracking-wide text-ink leading-tight">
                    {product.name}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="h-[2px] w-8 bg-wine rounded-full" />
                    <div className="w-1.5 h-1.5 bg-wine rounded-full" />
                  </div>
                </div>

                {/* Actions */}
                <ProductActions
                  product={product}
                  onSizeGuide={showSizeGuide ? () => setSizeGuideOpen(true) : undefined}
                />
              </div>
            </div>
          </div>

          {/* ── Footer ───────────────────── */}
          <div className="shrink-0 px-5 sm:px-6 py-3 border-t border-hairline bg-cream flex items-center justify-between gap-4">

            <div className="flex items-center gap-1.5 text-stone">
              <Truck className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="font-body text-xs">Free shipping over Rs. 3,000</span>
            </div>
            {/*
              <a href> not <Link> — avoids @modal/(.)product interceptor re-opening QuickView.
              Hard navigation goes directly to the full product page.
            */}
            <a
              href={`/product/${product.slug}`}
              className="flex items-center gap-1 font-body text-[13px] font-semibold text-wine hover:text-wine-deep transition-colors"
            >
              View full details
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </a>
          </div>
          {/* ── Close — last in DOM so it paints above the scrollable right panel ── */}
          <button
            ref={closeRef}
            type="button"
            onClick={dismiss}
            aria-label="Close"
            className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-cream hover:bg-hairline text-stone hover:text-ink transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </motion.div>
      </AnimatePresence>

      <SizeGuideModal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </>
  )
}
