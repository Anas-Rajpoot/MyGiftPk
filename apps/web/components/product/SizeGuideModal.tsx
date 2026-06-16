'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

interface SizeGuideModalProps {
  open: boolean
  onClose: () => void
}

const MEASUREMENTS = [
  { size: 'XS', chest: '32"', waist: '26"', hips: '35"', length: '52"' },
  { size: 'S',  chest: '34"', waist: '28"', hips: '37"', length: '53"' },
  { size: 'M',  chest: '36"', waist: '30"', hips: '39"', length: '54"' },
  { size: 'L',  chest: '38"', waist: '32"', hips: '41"', length: '55"' },
  { size: 'XL', chest: '40"', waist: '34"', hips: '43"', length: '56"' },
  { size: 'XXL',chest: '42"', waist: '36"', hips: '45"', length: '57"' },
]

export function SizeGuideModal({ open, onClose }: SizeGuideModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  // Escape-to-close, focus the close button on open, lock body scroll
  useEffect(() => {
    if (!open) return
    const saved = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      saved?.focus()
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-ink/50"
            aria-hidden
            onClick={onClose}
          />
          <motion.div
            key="modal"
            role="dialog"
            aria-modal
            aria-label="Size guide"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed left-4 right-4 top-1/2 -translate-y-1/2 z-50 bg-ivory rounded-card max-w-lg mx-auto shadow-[var(--shadow-float)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-hairline">
              <h2 className="font-display text-lg uppercase tracking-wide text-ink">Size Guide</h2>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close size guide"
                className="w-8 h-8 flex items-center justify-center text-stone hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine rounded-full"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto p-5">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="border-b border-hairline">
                    {['Size', 'Chest', 'Waist', 'Hips', 'Length'].map((h) => (
                      <th key={h} className="pb-2 text-left font-medium text-stone text-[11px] uppercase tracking-wider pr-4 last:pr-0">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MEASUREMENTS.map((row) => (
                    <tr key={row.size} className="border-b border-hairline last:border-0">
                      <td className="py-2.5 pr-4 font-medium text-ink">{row.size}</td>
                      <td className="py-2.5 pr-4 text-stone">{row.chest}</td>
                      <td className="py-2.5 pr-4 text-stone">{row.waist}</td>
                      <td className="py-2.5 pr-4 text-stone">{row.hips}</td>
                      <td className="py-2.5 text-stone">{row.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="px-5 pb-4 font-body text-[12px] text-stone">
              All measurements are approximate. For best fit, measure over light clothing.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
