'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import type { ShopFilters } from '@/lib/utils/filters'
import { buildFilterUrl, getActiveFilterCount, clearAllFilters } from '@/lib/utils/filters'

export interface CategoryOption { slug: string; name: string; count: number }

interface FilterSidebarProps {
  basePath: string
  filters: ShopFilters
  categories?: CategoryOption[]
}

/* ── Accordion wrapper ─────────────────────────────── */
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
    <div className="border-b border-hairline">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-3.5 group"
      >
        <span className="font-body text-[11px] uppercase tracking-[0.18em] font-semibold text-ink">
          {label}
        </span>
        <ChevronDown
          className={clsx(
            'h-3.5 w-3.5 text-stone shrink-0 transition-transform duration-200',
            open && 'rotate-180'
          )}
          aria-hidden
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Checkbox-style toggle ─────────────────────────── */
function FilterToggle({
  href,
  active,
  label,
  count,
}: {
  href: string
  active: boolean
  label: string
  count?: number
}) {
  return (
    <Link
      href={href}
      aria-pressed={active}
      className={clsx(
        'flex items-center gap-2 py-1 text-sm font-body transition-colors group',
        active ? 'text-wine' : 'text-stone hover:text-ink'
      )}
    >
      <span
        className={clsx(
          'w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center shrink-0 transition-colors',
          active ? 'border-wine bg-wine' : 'border-hairline bg-ivory group-hover:border-stone'
        )}
        aria-hidden
      >
        {active && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3 5.5L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="flex-1 leading-snug">{label}</span>
      {count !== undefined && (
        <span className="font-body text-[10px] text-stone/60 tabular-nums">({count})</span>
      )}
    </Link>
  )
}

/* ── Price ranges ──────────────────────────────────── */
const PRICE_RANGES = [
  { label: 'Under Rs. 1,500',       min: null,   max: '1500' },
  { label: 'Rs. 1,500 – 3,000',     min: '1500', max: '3000' },
  { label: 'Rs. 3,000 – 5,000',     min: '3000', max: '5000' },
  { label: 'Rs. 5,000 – 10,000',    min: '5000', max: '10000' },
  { label: 'Above Rs. 10,000',      min: '10000', max: null },
]

/* ── Gift occasions (category-based) ──────────────── */
const OCCASIONS = [
  { label: 'Birthday',      value: 'birthday' },
  { label: 'Anniversary',   value: 'anniversary' },
  { label: 'Wedding',       value: 'wedding' },
  { label: 'Eid',           value: 'eid' },
  { label: "Valentine's",   value: 'valentines-day' },
  { label: "Mother's Day",  value: 'mothers-day' },
]

/* ── Size chips ────────────────────────────────────── */
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

/* ── Sort options ──────────────────────────────────── */
const SORT_OPTIONS = [
  { label: 'Newest',             value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
]

/* ── Main sidebar ──────────────────────────────────── */
export function FilterSidebar({ basePath, filters, categories = [] }: FilterSidebarProps) {
  const activeCount = getActiveFilterCount(filters)

  const priceActive = (min: string | null, max: string | null) =>
    filters.min_price === (min ?? undefined) && filters.max_price === (max ?? undefined)

  return (
    <aside aria-label="Product filters" className="hidden lg:block w-[220px] shrink-0">
      <div className="sticky top-24">
        {/* Header */}
        <div className="flex items-center justify-between py-3.5 border-b border-hairline">
          <span className="font-body text-[11px] uppercase tracking-[0.18em] font-semibold text-ink flex items-center gap-2">
            Filters
            {activeCount > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-wine text-ivory text-[9px] font-semibold">
                {activeCount}
              </span>
            )}
          </span>
          {activeCount > 0 && (
            <Link
              href={clearAllFilters(basePath, filters)}
              className="flex items-center gap-1 font-body text-[11px] text-stone hover:text-wine transition-colors"
            >
              <X className="h-3 w-3" aria-hidden />
              Clear
            </Link>
          )}
        </div>

        {/* ── Categories (closed by default) ── */}
        {categories.length > 0 && (
          <Section label="Categories" defaultOpen={false}>
            <div className="space-y-0.5">
              {categories.map((cat) => (
                <FilterToggle
                  key={cat.slug}
                  href={buildFilterUrl(basePath, filters, {
                    category: filters.category === cat.slug ? null : cat.slug,
                  })}
                  active={filters.category === cat.slug}
                  label={cat.name}
                  count={cat.count}
                />
              ))}
            </div>
          </Section>
        )}

        {/* ── Price (closed by default) ── */}
        <Section label="Price" defaultOpen={false}>
          <div className="space-y-0.5">
            {PRICE_RANGES.map((r) => {
              const active = priceActive(r.min, r.max)
              return (
                <FilterToggle
                  key={r.label}
                  href={buildFilterUrl(basePath, filters, {
                    min_price: active ? null : (r.min ?? null),
                    max_price: active ? null : (r.max ?? null),
                  })}
                  active={active}
                  label={r.label}
                />
              )
            })}
          </div>
        </Section>

        {/* ── Gift & Occasions (closed by default) ── */}
        <Section label="Gift & Occasions" defaultOpen={false}>
          <div className="space-y-0.5">
            {OCCASIONS.map((occ) => (
              <FilterToggle
                key={occ.value}
                href={buildFilterUrl(basePath, filters, {
                  category: filters.category === occ.value ? null : occ.value,
                })}
                active={filters.category === occ.value}
                label={occ.label}
              />
            ))}
          </div>
        </Section>

        {/* ── Size (open by default) ── */}
        <Section label="Size" defaultOpen>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {SIZES.map((s) => {
              const active = filters.size === s.toLowerCase()
              return (
                <Link
                  key={s}
                  href={buildFilterUrl(basePath, filters, {
                    size: active ? null : s.toLowerCase(),
                  })}
                  aria-pressed={active}
                  className={clsx(
                    'inline-flex items-center justify-center h-7 w-9 rounded-input border text-[11px] font-body transition-colors',
                    active
                      ? 'border-wine bg-wine text-ivory'
                      : 'border-hairline bg-ivory text-ink hover:border-wine hover:text-wine'
                  )}
                >
                  {s}
                </Link>
              )
            })}
          </div>
        </Section>

        {/* ── On Sale (open by default) ── */}
        <Section label="Deals" defaultOpen>
          <FilterToggle
            href={buildFilterUrl(basePath, filters, {
              on_sale: filters.on_sale === '1' ? null : '1',
            })}
            active={filters.on_sale === '1'}
            label="On Sale"
          />
        </Section>

        {/* ── Sort (open by default) ── */}
        <Section label="Sort By" defaultOpen>
          <div className="space-y-0.5">
            {SORT_OPTIONS.map((opt) => (
              <FilterToggle
                key={opt.value}
                href={buildFilterUrl(basePath, filters, {
                  sort: filters.sort === opt.value ? null : opt.value,
                })}
                active={filters.sort === opt.value}
                label={opt.label}
              />
            ))}
          </div>
        </Section>
      </div>
    </aside>
  )
}
