import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'
import { buildFilterUrl } from '@/lib/utils/filters'
import type { ShopFilters } from '@/lib/utils/filters'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
  filters: ShopFilters
}

function pages(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total]
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '…', current - 1, current, current + 1, '…', total]
}

export function Pagination({ currentPage, totalPages, basePath, filters }: PaginationProps) {
  if (totalPages <= 1) return null

  const pageUrl = (p: number) => buildFilterUrl(basePath, filters, { page: String(p) })
  const items = pages(currentPage, totalPages)

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 pt-10">
      {/* Prev */}
      {currentPage > 1 ? (
        <Link
          href={pageUrl(currentPage - 1)}
          aria-label="Previous page"
          className="flex items-center gap-1 h-9 px-3 rounded-input border border-hairline font-body text-sm text-stone hover:border-wine hover:text-wine transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
          Prev
        </Link>
      ) : (
        <span className="flex items-center gap-1 h-9 px-3 rounded-input border border-hairline font-body text-sm text-stone/30 cursor-not-allowed">
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
          Prev
        </span>
      )}

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {items.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center font-body text-sm text-stone/50">
              …
            </span>
          ) : (
            <Link
              key={p}
              href={pageUrl(p)}
              aria-label={`Page ${p}`}
              aria-current={p === currentPage ? 'page' : undefined}
              className={clsx(
                'w-9 h-9 flex items-center justify-center rounded-input border font-body text-sm transition-colors',
                p === currentPage
                  ? 'border-wine bg-wine text-ivory pointer-events-none'
                  : 'border-hairline text-stone hover:border-wine hover:text-wine'
              )}
            >
              {p}
            </Link>
          )
        )}
      </div>

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={pageUrl(currentPage + 1)}
          aria-label="Next page"
          className="flex items-center gap-1 h-9 px-3 rounded-input border border-hairline font-body text-sm text-stone hover:border-wine hover:text-wine transition-colors"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      ) : (
        <span className="flex items-center gap-1 h-9 px-3 rounded-input border border-hairline font-body text-sm text-stone/30 cursor-not-allowed">
          Next
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </span>
      )}
    </nav>
  )
}
