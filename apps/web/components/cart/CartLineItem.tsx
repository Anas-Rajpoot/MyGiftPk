'use client'

import Image from 'next/image'
import Link from 'next/link'
import { X } from 'lucide-react'
import { QtyStepper } from '@/components/ui/QtyStepper'
import type { CartLineItem as CartLineItemType } from '@/lib/cart/normalize'

interface CartLineItemProps {
  item: CartLineItemType
  onQtyChange: (key: string, qty: number) => void
  onRemove: (key: string) => void
  isLoading?: boolean
}

export function CartLineItem({ item, onQtyChange, onRemove, isLoading }: CartLineItemProps) {
  return (
    <div className="flex gap-3 py-4 border-b border-hairline last:border-0">
      {/* Thumbnail */}
      <Link href={`/product/${item.slug}`} className="shrink-0" tabIndex={-1} aria-hidden>
        <div className="relative w-16 h-20 rounded border border-hairline bg-cream overflow-hidden">
          {item.image ? (
            <Image
              src={item.image.sourceUrl}
              alt={item.image.altText || item.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-wine-tint" />
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              href={`/product/${item.slug}`}
              className="font-body text-sm font-medium text-ink hover:text-wine transition-colors line-clamp-2 leading-snug"
            >
              {item.name}
            </Link>
            {item.variationLabel && (
              <p className="font-body text-xs text-stone mt-0.5">{item.variationLabel}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onRemove(item.key)}
            aria-label={`Remove ${item.name}`}
            disabled={isLoading}
            className="shrink-0 w-6 h-6 flex items-center justify-center text-stone hover:text-wine transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <QtyStepper
            value={item.quantity}
            onChange={(qty) => onQtyChange(item.key, qty)}
            min={1}
            max={10}
            disabled={isLoading}
            className="scale-[0.85] origin-left"
          />
          <span className="font-body text-sm font-semibold text-ink tabular-nums">
            {item.lineTotal}
          </span>
        </div>
      </div>
    </div>
  )
}
