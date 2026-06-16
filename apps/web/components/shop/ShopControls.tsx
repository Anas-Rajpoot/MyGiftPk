'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { ProductCardGrid } from '@/components/product/ProductCardGrid'
import type { ProductNode } from '@/lib/wp/queries/products'

function GridIcon({ cols }: { cols: 2 | 3 | 4 }) {
  return (
    <div
      className="grid gap-[2px] w-[14px] h-[14px]"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      aria-hidden
    >
      {Array.from({ length: cols * 2 }).map((_, i) => (
        <div key={i} className="bg-current rounded-[1px]" />
      ))}
    </div>
  )
}

interface ShopControlsProps {
  products: ProductNode[]
  found: number
}

export function ShopControls({ products, found }: ShopControlsProps) {
  const [cols, setCols] = useState<2 | 3 | 4>(3)

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="font-body text-xs text-stone">
          {found > 0 ? `${found} product${found !== 1 ? 's' : ''}` : 'No products found'}
        </p>

        {/* Column toggle — desktop only */}
        <div className="hidden sm:flex items-center gap-0.5 border border-hairline rounded-input p-0.5">
          {([2, 3, 4] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCols(n)}
              aria-label={`${n} columns`}
              title={`${n} columns`}
              className={clsx(
                'flex items-center justify-center w-7 h-7 rounded transition-colors',
                cols === n
                  ? 'bg-wine text-ivory'
                  : 'text-stone hover:text-ink hover:bg-cream'
              )}
            >
              <GridIcon cols={n} />
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {products.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-body text-stone text-sm">No products found for these filters.</p>
          <p className="font-body text-stone/60 text-xs mt-1">Try removing some filters.</p>
        </div>
      ) : (
        <ProductCardGrid products={products} columns={cols} />
      )}
    </div>
  )
}
