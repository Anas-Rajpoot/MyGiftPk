'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { X, SlidersHorizontal } from 'lucide-react'
import { clsx } from 'clsx'
import type { ShopFilters } from '@/lib/utils/filters'
import { buildFilterUrl, getActiveFilterCount } from '@/lib/utils/filters'

interface FilterOption { label: string; value: string }

const TYPES: FilterOption[] = [
  { label: 'Stitched', value: 'stitched' },
  { label: 'Unstitched', value: 'unstitched' },
]

const SIZES: FilterOption[] = [
  { label: 'XS', value: 'xs' },
  { label: 'S', value: 's' },
  { label: 'M', value: 'm' },
  { label: 'L', value: 'l' },
  { label: 'XL', value: 'xl' },
  { label: 'XXL', value: 'xxl' },
]

const SORT_OPTIONS: FilterOption[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'On Sale', value: 'sale' },
]

interface FilterBottomSheetProps {
  basePath: string
  filters: ShopFilters
}

export function FilterBottomSheet({ basePath, filters }: FilterBottomSheetProps) {
  const [open, setOpen] = useState(false)
  // Local pending state — only applied on "Show Results"
  const [pending, setPending] = useState<ShopFilters>(filters)
  const router = useRouter()
  const activeCount = getActiveFilterCount(filters)

  function toggle(key: keyof ShopFilters, value: string) {
    setPending((prev) => ({ ...prev, [key]: prev[key] === value ? undefined : value }))
  }

  function apply() {
    const url = buildFilterUrl(basePath, pending, {})
    router.push(url)
    setOpen(false)
  }

  function clear() {
    const cleared: ShopFilters = {}
    if (filters.sort) cleared.sort = filters.sort
    setPending(cleared)
  }

  const pendingCount = getActiveFilterCount(pending)

  return (
    <>
      {/* Trigger button — mobile only */}
      <button
        type="button"
        onClick={() => { setPending(filters); setOpen(true) }}
        className="lg:hidden flex items-center gap-2 h-10 px-4 rounded-input border border-hairline bg-ivory text-sm font-body text-ink"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <SlidersHorizontal className="h-4 w-4 text-stone" aria-hidden />
        Filters
        {activeCount > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-wine text-ivory text-[11px]">
            {activeCount}
          </span>
        )}
      </button>

      {/* Sheet */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-ink/50"
              aria-hidden
              onClick={() => setOpen(false)}
            />

            {/* Sheet panel */}
            <motion.div
              key="sheet"
              role="dialog"
              aria-modal
              aria-label="Product filters"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-ivory rounded-t-2xl max-h-[85dvh] flex flex-col"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1" aria-hidden>
                <span className="w-10 h-1 rounded-full bg-hairline" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-hairline">
                <span className="font-display text-sm uppercase tracking-widest text-ink">
                  Filters
                </span>
                {pendingCount > 0 && (
                  <button
                    type="button"
                    onClick={clear}
                    className="text-[13px] text-stone hover:text-wine transition-colors"
                  >
                    Clear all
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close filters"
                  className="ml-auto w-8 h-8 flex items-center justify-center text-stone hover:text-ink"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
                {/* Type */}
                <SheetGroup label="Type">
                  <div className="flex flex-wrap gap-2">
                    {TYPES.map((opt) => (
                      <PillToggle
                        key={opt.value}
                        active={pending.type === opt.value}
                        label={opt.label}
                        onClick={() => toggle('type', opt.value)}
                      />
                    ))}
                  </div>
                </SheetGroup>

                {/* Size */}
                <SheetGroup label="Size">
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggle('size', opt.value)}
                        aria-pressed={pending.size === opt.value}
                        className={clsx(
                          'inline-flex items-center justify-center h-9 w-11 rounded-input border text-sm font-body transition-colors',
                          pending.size === opt.value
                            ? 'border-wine bg-wine text-ivory'
                            : 'border-hairline bg-ivory text-ink'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </SheetGroup>

                {/* Deals */}
                <SheetGroup label="Deals">
                  <PillToggle
                    active={pending.on_sale === '1'}
                    label="On Sale"
                    onClick={() => toggle('on_sale', '1')}
                  />
                </SheetGroup>

                {/* Sort */}
                <SheetGroup label="Sort By">
                  <div className="space-y-2">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setPending((prev) => ({ ...prev, sort: prev.sort === opt.value ? undefined : opt.value }))}
                        aria-pressed={pending.sort === opt.value}
                        className={clsx(
                          'w-full text-left text-sm font-body px-3 py-2 rounded-input transition-colors',
                          pending.sort === opt.value
                            ? 'bg-wine-tint text-wine font-medium'
                            : 'text-ink hover:bg-cream'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </SheetGroup>
              </div>

              {/* Footer — Apply */}
              <div className="px-5 py-4 border-t border-hairline">
                <button
                  type="button"
                  onClick={apply}
                  className="w-full h-12 bg-wine hover:bg-wine-deep text-ivory font-body font-medium rounded-input transition-colors"
                >
                  Show Results
                  {pendingCount > 0 && ` (${pendingCount} filter${pendingCount > 1 ? 's' : ''})`}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function SheetGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="font-body text-[11px] uppercase tracking-widest text-stone">{label}</p>
      {children}
    </div>
  )
}

function PillToggle({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        'h-9 px-4 rounded-chip border text-sm font-body transition-colors',
        active ? 'border-wine bg-wine text-ivory' : 'border-hairline bg-ivory text-ink'
      )}
    >
      {label}
    </button>
  )
}
