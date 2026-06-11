import Link from 'next/link'
import { X } from 'lucide-react'
import type { ShopFilters } from '@/lib/utils/filters'
import { buildFilterUrl, getActiveFilterCount } from '@/lib/utils/filters'

const LABELS: Partial<Record<keyof ShopFilters, (v: string) => string>> = {
  type: (v) => v.charAt(0).toUpperCase() + v.slice(1),
  size: (v) => `Size: ${v.toUpperCase()}`,
  on_sale: () => 'On Sale',
  min_price: (v) => `From Rs. ${v}`,
  max_price: (v) => `Up to Rs. ${v}`,
}

const FILTER_KEYS: (keyof ShopFilters)[] = ['type', 'size', 'on_sale', 'min_price', 'max_price']

interface ActiveFiltersProps {
  basePath: string
  filters: ShopFilters
}

export function ActiveFilters({ basePath, filters }: ActiveFiltersProps) {
  const active = FILTER_KEYS.filter((k) => Boolean(filters[k]))
  if (active.length === 0) return null

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      aria-label={`${getActiveFilterCount(filters)} active filters`}
    >
      {active.map((key) => {
        const value = filters[key]!
        const label = LABELS[key]?.(value) ?? value
        return (
          <Link
            key={key}
            href={buildFilterUrl(basePath, filters, { [key]: null })}
            className="inline-flex items-center gap-1.5 h-8 pl-3 pr-2 rounded-chip border border-wine bg-wine-tint text-wine text-sm font-body hover:bg-wine hover:text-ivory transition-colors"
            aria-label={`Remove filter: ${label}`}
          >
            {label}
            <X className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </Link>
        )
      })}
    </div>
  )
}
