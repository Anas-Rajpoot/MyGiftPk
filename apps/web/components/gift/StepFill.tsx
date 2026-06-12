'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { Plus, Minus, X, Package, Coffee, Heart, Cookie, Sparkles } from 'lucide-react'
import { useGiftStore, selectSlotsUsed } from '@/lib/stores/gift'
import type { GiftComponent } from '@/lib/wp/queries/gift'

interface StepFillProps {
  components: GiftComponent[]
  categories: string[]
}

export function StepFill({ components, categories }: StepFillProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0] ?? 'Chocolates')

  const capacity = useGiftStore((s) => s.capacity)
  const items = useGiftStore((s) => s.items)
  const boxName = useGiftStore((s) => s.boxName)
  const addItem = useGiftStore((s) => s.addItem)
  const removeItem = useGiftStore((s) => s.removeItem)
  const updateItemQty = useGiftStore((s) => s.updateItemQty)
  const slotsUsed = useGiftStore(selectSlotsUsed)

  const isFull = slotsUsed >= capacity
  const visibleComponents = components.filter((c) => c.category === activeCategory)

  function handleAdd(comp: GiftComponent) {
    if (isFull || comp.stockStatus === 'OUT_OF_STOCK') return
    addItem({
      productId: comp.productId,
      name: comp.name,
      image: comp.image?.sourceUrl ?? null,
      unitPrice: comp.price,
    })
  }

  return (
    <div className="pb-4">
      {/* Capacity indicator */}
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl uppercase tracking-wide text-ink leading-none mb-0.5">
            Fill Your Box
          </h1>
          <p className="font-body text-xs text-stone">{boxName}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: capacity }).map((_, i) => (
              <div
                key={i}
                className={clsx(
                  'w-2.5 h-2.5 rounded-full transition-colors',
                  i < slotsUsed ? 'bg-gold' : 'bg-hairline'
                )}
              />
            ))}
          </div>
          <span className="font-body text-[11px] text-stone tabular-nums">
            {slotsUsed}/{capacity} slots
          </span>
        </div>
      </div>

      {isFull && (
        <div className="mx-4 mb-3 px-4 py-2.5 rounded-input bg-gold-tint border border-gold/30 flex items-center gap-2">
          <Package className="h-4 w-4 text-gold shrink-0" aria-hidden />
          <p className="font-body text-xs text-ink">
            Your box is full! Remove an item or go back to choose a bigger box.
          </p>
        </div>
      )}

      {/* Category tabs */}
      <div className="flex border-b border-hairline overflow-x-auto scrollbar-none px-4 gap-0">
        {categories.map((cat) => {
          const isActive = cat === activeCategory
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={clsx(
                'relative shrink-0 px-4 py-2.5 font-body text-sm font-medium transition-colors whitespace-nowrap',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset',
                isActive ? 'text-gold' : 'text-stone hover:text-ink'
              )}
            >
              {cat}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
              )}
            </button>
          )
        })}
      </div>

      {/* Component grid */}
      <div className="px-4 pt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {visibleComponents.map((comp) => {
          const addedItem = items.find((i) => i.productId === comp.productId)
          const isOOS = comp.stockStatus === 'OUT_OF_STOCK'
          const canAdd = !isFull && !isOOS
          const imgSrc = comp.image?.sourceUrl ?? null

          return (
            <div
              key={comp.productId}
              className={clsx(
                'rounded-card border overflow-hidden bg-ivory flex flex-col transition-opacity',
                addedItem ? 'border-gold' : 'border-hairline',
                isOOS && 'opacity-50'
              )}
            >
              {/* Thumbnail */}
              <div className="aspect-square bg-cream flex items-center justify-center relative">
                {imgSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imgSrc} alt={comp.name} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-hairline" aria-hidden>
                    {comp.category === 'Chocolates' ? <Coffee className="h-12 w-12" /> :
                     comp.category === 'Candies' ? <Heart className="h-12 w-12" /> :
                     comp.category === 'Biscuits' ? <Cookie className="h-12 w-12" /> :
                     <Sparkles className="h-12 w-12" />}
                  </span>
                )}
                {addedItem && (
                  <button
                    type="button"
                    onClick={() => removeItem(comp.productId)}
                    aria-label={`Remove ${comp.name}`}
                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-gold flex items-center justify-center shadow-sm"
                  >
                    <X className="h-3 w-3 text-ivory" aria-hidden />
                  </button>
                )}
              </div>

              {/* Info */}
              <div className="p-2.5 flex flex-col gap-2 flex-1">
                <div className="flex-1">
                  <p className={clsx('font-body text-xs font-medium leading-snug', isOOS && 'line-through')}>
                    {comp.name}
                  </p>
                  <p className="font-body text-[11px] text-stone tabular-nums mt-0.5">
                    Rs. {comp.price.toLocaleString('en-PK')}
                  </p>
                  {isOOS && (
                    <p className="font-body text-[10px] text-stone mt-0.5">Out of stock</p>
                  )}
                </div>

                {addedItem ? (
                  <div className="flex items-center justify-between rounded-input border border-gold overflow-hidden">
                    <button
                      type="button"
                      onClick={() => updateItemQty(comp.productId, addedItem.qty - 1)}
                      aria-label="Decrease quantity"
                      className="h-7 w-7 flex items-center justify-center text-gold hover:bg-gold-tint transition-colors"
                    >
                      <Minus className="h-3 w-3" aria-hidden />
                    </button>
                    <span className="font-body text-xs font-medium text-ink tabular-nums">
                      {addedItem.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateItemQty(comp.productId, addedItem.qty + 1)}
                      disabled={isFull}
                      aria-label="Increase quantity"
                      className="h-7 w-7 flex items-center justify-center text-gold hover:bg-gold-tint transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-3 w-3" aria-hidden />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAdd(comp)}
                    disabled={!canAdd}
                    className="h-7 w-full rounded-input bg-gold hover:bg-amber-600 text-ivory font-body text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                  >
                    <Plus className="h-3 w-3" aria-hidden />
                    Add
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Selection tray */}
      {items.length > 0 && (
        <div className="mx-4 mt-4 rounded-card border border-hairline bg-ivory p-3">
          <p className="font-body text-xs font-medium text-stone mb-2">
            In your box ({slotsUsed} item{slotsUsed !== 1 ? 's' : ''})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {items.map((item) => (
              <span
                key={item.productId}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-chip bg-gold-tint border border-gold/30 font-body text-xs text-ink"
              >
                {item.name}
                {item.qty > 1 && (
                  <span className="font-medium text-gold">×{item.qty}</span>
                )}
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  aria-label={`Remove ${item.name}`}
                  className="ml-0.5 text-stone hover:text-ink transition-colors"
                >
                  <X className="h-3 w-3" aria-hidden />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
