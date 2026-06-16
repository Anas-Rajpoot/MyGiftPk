'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { clsx } from 'clsx'
import type { ShopFilters } from '@/lib/utils/filters'
import { buildFilterUrl, getActiveFilterCount } from '@/lib/utils/filters'
import type { CategoryOption } from './FilterSidebar'

/* ── Section (accordion inside the sheet) ─────────── */
function Section({
  label,
  defaultOpen = false,
  children,
}: {
  label: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-hairline last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-3.5"
        aria-expanded={open}
      >
        <span className="font-body text-[11px] uppercase tracking-[0.18em] font-semibold text-ink">
          {label}
        </span>
        <ChevronDown
          className={clsx('h-3.5 w-3.5 text-stone shrink-0 transition-transform duration-200', open && 'rotate-180')}
          aria-hidden
        />
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  )
}

/* ── Pill chip toggle ──────────────────────────────── */
function Pill({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
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

/* ── Checkbox-style row ────────────────────────────── */
function CheckRow({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean
  label: string
  count?: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        'w-full flex items-center gap-2.5 py-1.5 text-sm font-body transition-colors text-left',
        active ? 'text-wine' : 'text-stone'
      )}
    >
      <span
        className={clsx(
          'w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center shrink-0 transition-colors',
          active ? 'border-wine bg-wine' : 'border-hairline bg-ivory'
        )}
        aria-hidden
      >
        {active && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3 5.5L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="flex-1">{label}</span>
      {count !== undefined && (
        <span className="font-body text-[10px] text-stone/50 tabular-nums">({count})</span>
      )}
    </button>
  )
}

/* ── Data ──────────────────────────────────────────── */
const PRICE_RANGES = [
  { label: 'Under Rs. 1,500',    min: null,    max: '1500' },
  { label: 'Rs. 1,500 – 3,000', min: '1500',  max: '3000' },
  { label: 'Rs. 3,000 – 5,000', min: '3000',  max: '5000' },
  { label: 'Rs. 5,000 – 10,000',min: '5000',  max: '10000' },
  { label: 'Above Rs. 10,000',  min: '10000', max: null },
]

const OCCASIONS = [
  { label: 'Birthday',     value: 'birthday' },
  { label: 'Anniversary',  value: 'anniversary' },
  { label: 'Wedding',      value: 'wedding' },
  { label: 'Eid',          value: 'eid' },
  { label: "Valentine's",  value: 'valentines-day' },
  { label: "Mother's Day", value: 'mothers-day' },
]

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const SORT_OPTIONS = [
  { label: 'Newest',             value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
]

/* ── Props ─────────────────────────────────────────── */
interface FilterBottomSheetProps {
  basePath: string
  filters: ShopFilters
  categories?: CategoryOption[]
}

/* ── Component ─────────────────────────────────────── */
export function FilterBottomSheet({ basePath, filters, categories = [] }: FilterBottomSheetProps) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState<ShopFilters>(filters)
  const router = useRouter()
  const activeCount = getActiveFilterCount(filters)

  function toggle<K extends keyof ShopFilters>(key: K, value: ShopFilters[K]) {
    setPending((prev) => ({ ...prev, [key]: prev[key] === value ? undefined : value }))
  }

  function setPrice(min: string | null, max: string | null) {
    const cur = pending.min_price === (min ?? undefined) && pending.max_price === (max ?? undefined)
    setPending((prev) => ({
      ...prev,
      min_price: cur ? undefined : (min ?? undefined),
      max_price: cur ? undefined : (max ?? undefined),
    }))
  }

  function apply() {
    router.push(buildFilterUrl(basePath, pending, {}))
    setOpen(false)
  }

  function clear() {
    setPending(filters.sort ? { sort: filters.sort } : {})
  }

  const pendingCount = getActiveFilterCount(pending)

  return (
    <>
      {/* Trigger — mobile only */}
      <button
        type="button"
        onClick={() => { setPending(filters); setOpen(true) }}
        className="lg:hidden flex items-center gap-2 h-10 px-4 rounded-input border border-hairline bg-ivory font-body text-sm text-ink"
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

            <motion.div
              key="sheet"
              role="dialog"
              aria-modal
              aria-label="Product filters"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-ivory rounded-t-2xl max-h-[88dvh] flex flex-col"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0" aria-hidden>
                <span className="w-10 h-1 rounded-full bg-hairline" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-hairline shrink-0">
                <span className="font-display text-sm uppercase tracking-widest text-ink">
                  Filters
                  {pendingCount > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-wine text-ivory text-[9px]">
                      {pendingCount}
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-3">
                  {pendingCount > 0 && (
                    <button type="button" onClick={clear} className="font-body text-xs text-stone hover:text-wine transition-colors">
                      Clear all
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close filters"
                    className="w-8 h-8 flex items-center justify-center text-stone hover:text-ink"
                  >
                    <X className="h-5 w-5" aria-hidden />
                  </button>
                </div>
              </div>

              {/* Scrollable body */}
              <div
                className={[
                  'flex-1 overflow-y-auto px-5',
                  '[&::-webkit-scrollbar]:w-[3px]',
                  '[&::-webkit-scrollbar-track]:bg-transparent',
                  '[&::-webkit-scrollbar-thumb]:bg-hairline',
                  '[&::-webkit-scrollbar-thumb]:rounded-full',
                ].join(' ')}
              >
                {/* Categories (closed by default) */}
                {categories.length > 0 && (
                  <Section label="Categories" defaultOpen={false}>
                    <div className="space-y-0.5">
                      {categories.map((cat) => (
                        <CheckRow
                          key={cat.slug}
                          active={pending.category === cat.slug}
                          label={cat.name}
                          count={cat.count}
                          onClick={() => toggle('category', pending.category === cat.slug ? undefined : cat.slug)}
                        />
                      ))}
                    </div>
                  </Section>
                )}

                {/* Price (closed by default) */}
                <Section label="Price" defaultOpen={false}>
                  <div className="space-y-0.5">
                    {PRICE_RANGES.map((r) => {
                      const active =
                        pending.min_price === (r.min ?? undefined) &&
                        pending.max_price === (r.max ?? undefined)
                      return (
                        <CheckRow
                          key={r.label}
                          active={active}
                          label={r.label}
                          onClick={() => setPrice(r.min, r.max)}
                        />
                      )
                    })}
                  </div>
                </Section>

                {/* Gift & Occasions (closed by default) */}
                <Section label="Gift & Occasions" defaultOpen={false}>
                  <div className="flex flex-wrap gap-2">
                    {OCCASIONS.map((occ) => (
                      <Pill
                        key={occ.value}
                        active={pending.category === occ.value}
                        label={occ.label}
                        onClick={() => toggle('category', pending.category === occ.value ? undefined : occ.value)}
                      />
                    ))}
                  </div>
                </Section>

                {/* Size (open by default) */}
                <Section label="Size" defaultOpen>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {SIZES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggle('size', pending.size === s.toLowerCase() ? undefined : s.toLowerCase())}
                        aria-pressed={pending.size === s.toLowerCase()}
                        className={clsx(
                          'inline-flex items-center justify-center h-9 w-11 rounded-input border font-body text-sm transition-colors',
                          pending.size === s.toLowerCase()
                            ? 'border-wine bg-wine text-ivory'
                            : 'border-hairline bg-ivory text-ink'
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </Section>

                {/* Deals (open by default) */}
                <Section label="Deals" defaultOpen>
                  <Pill
                    active={pending.on_sale === '1'}
                    label="On Sale"
                    onClick={() => toggle('on_sale', pending.on_sale === '1' ? undefined : '1')}
                  />
                </Section>

                {/* Sort (open by default) */}
                <Section label="Sort By" defaultOpen>
                  <div className="space-y-1">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() =>
                          setPending((prev) => ({
                            ...prev,
                            sort: prev.sort === opt.value ? undefined : opt.value,
                          }))
                        }
                        aria-pressed={pending.sort === opt.value}
                        className={clsx(
                          'w-full text-left font-body text-sm px-3 py-2 rounded-input transition-colors',
                          pending.sort === opt.value
                            ? 'bg-wine-tint text-wine font-medium'
                            : 'text-ink hover:bg-cream'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </Section>

                {/* Bottom padding so content doesn't sit behind footer */}
                <div className="h-4" />
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-hairline shrink-0">
                <button
                  type="button"
                  onClick={apply}
                  className="w-full h-12 bg-wine hover:bg-wine-deep text-ivory font-body font-semibold rounded-input transition-colors"
                >
                  Show Results{pendingCount > 0 ? ` (${pendingCount} filter${pendingCount !== 1 ? 's' : ''})` : ''}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
