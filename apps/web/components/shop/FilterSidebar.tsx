'use client'

import Link from 'next/link'
import { clsx } from 'clsx'
import type { ShopFilters } from '@/lib/utils/filters'
import { buildFilterUrl, getActiveFilterCount, clearAllFilters } from '@/lib/utils/filters'

interface FilterOption {
  label: string
  value: string
}

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

interface FilterSidebarProps {
  basePath: string
  filters: ShopFilters
}

export function FilterSidebar({ basePath, filters }: FilterSidebarProps) {
  const activeCount = getActiveFilterCount(filters)

  return (
    <aside aria-label="Product filters" className="hidden lg:block w-56 shrink-0">
      <div className="sticky top-24 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm uppercase tracking-widest text-ink">
            Filters
            {activeCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-wine text-ivory text-[11px]">
                {activeCount}
              </span>
            )}
          </h2>
          {activeCount > 0 && (
            <Link
              href={clearAllFilters(basePath, filters)}
              className="text-[13px] text-stone hover:text-wine transition-colors"
            >
              Clear all
            </Link>
          )}
        </div>

        {/* Type */}
        <FilterGroup label="Type">
          {TYPES.map((opt) => {
            const active = filters.type === opt.value
            return (
              <FilterToggle
                key={opt.value}
                href={buildFilterUrl(basePath, filters, { type: active ? null : opt.value })}
                active={active}
                label={opt.label}
              />
            )
          })}
        </FilterGroup>

        {/* Size */}
        <FilterGroup label="Size">
          <div className="flex flex-wrap gap-2">
            {SIZES.map((opt) => {
              const active = filters.size === opt.value
              return (
                <Link
                  key={opt.value}
                  href={buildFilterUrl(basePath, filters, { size: active ? null : opt.value })}
                  className={clsx(
                    'inline-flex items-center justify-center h-8 w-10 rounded-input border text-sm font-body transition-colors',
                    active
                      ? 'border-wine bg-wine text-ivory'
                      : 'border-hairline bg-ivory text-ink hover:border-wine hover:text-wine'
                  )}
                  aria-pressed={active}
                >
                  {opt.label}
                </Link>
              )
            })}
          </div>
        </FilterGroup>

        {/* On Sale */}
        <FilterGroup label="Deals">
          <FilterToggle
            href={buildFilterUrl(basePath, filters, { on_sale: filters.on_sale === '1' ? null : '1' })}
            active={filters.on_sale === '1'}
            label="On Sale"
          />
        </FilterGroup>

        {/* Sort */}
        <FilterGroup label="Sort By">
          {SORT_OPTIONS.map((opt) => {
            const active = filters.sort === opt.value
            return (
              <FilterToggle
                key={opt.value}
                href={buildFilterUrl(basePath, filters, { sort: active ? null : opt.value })}
                active={active}
                label={opt.label}
              />
            )
          })}
        </FilterGroup>
      </div>
    </aside>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-hairline pt-4 space-y-2">
      <p className="font-body text-[11px] uppercase tracking-widest text-stone mb-3">{label}</p>
      {children}
    </div>
  )
}

function FilterToggle({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={clsx(
        'flex items-center gap-2 text-sm font-body transition-colors',
        active ? 'text-wine font-medium' : 'text-ink hover:text-wine'
      )}
      aria-pressed={active}
    >
      <span
        className={clsx(
          'w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors',
          active ? 'border-wine bg-wine' : 'border-hairline bg-ivory'
        )}
        aria-hidden
      >
        {active && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label}
    </Link>
  )
}
