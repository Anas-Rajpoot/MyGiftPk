'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { Gift, MessageSquare, Ribbon, Tag, ShoppingBag, AlertCircle } from 'lucide-react'
import { useGiftStore, selectDisplayTotal } from '@/lib/stores/gift'
import { useCartStore } from '@/lib/stores/cart'
import type { CartData } from '@/lib/cart/normalize'

interface StepReviewProps {
  onSuccess: () => void
}

export function StepReview({ onSuccess }: StepReviewProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [priceUpdated, setPriceUpdated] = useState(false)

  const { boxName, boxImage, items, message, ribbonColor, addOns, occasion, basePrice, reset } =
    useGiftStore((s) => s)
  const displayTotal = useGiftStore(selectDisplayTotal)
  const setCart = useCartStore((s) => s.setCart)
  const openCart = useCartStore((s) => s.openCart)

  async function handleAddToCart() {
    setIsSubmitting(true)
    setError(null)
    setPriceUpdated(false)

    const payload = {
      boxId: useGiftStore.getState().boxId,
      items: items.map(({ productId, qty }) => ({ productId, qty })),
      addOns: addOns.map((a) => a.id),
      message,
      ribbonColor,
      occasion,
      clientTotal: displayTotal,
    }

    try {
      const res = await fetch('/api/gift/add-to-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.status === 409) {
        const data = await res.json() as { error: string; updatedTotal?: number }
        setError(data.error)
        setPriceUpdated(true)
        setIsSubmitting(false)
        return
      }

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        setError(data.error ?? 'Something went wrong. Please try again.')
        setIsSubmitting(false)
        return
      }

      const bundleData = await res.json() as CartData
      // Merge the bundle item into the current cart rather than replacing it
      const currentCart = useCartStore.getState().cart
      if (currentCart && bundleData.items.length > 0) {
        const mergedItems = [...currentCart.items, ...bundleData.items]
        setCart({
          ...currentCart,
          items: mergedItems,
          itemCount: mergedItems.reduce((s, i) => s + i.quantity, 0),
        })
      } else {
        setCart(bundleData)
      }
      openCart()
      reset()
      onSuccess()
    } catch {
      setError('Network error — please check your connection.')
      setIsSubmitting(false)
    }
  }

  const itemsTotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0)
  const addOnsTotal = addOns.reduce((s, a) => s + a.price, 0)

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      <div>
        <h1 className="font-display text-2xl uppercase tracking-wide text-ink mb-0.5">
          Review Your Gift
        </h1>
        <p className="font-body text-sm text-stone">Everything looks right? Add it to your cart.</p>
      </div>

      {/* Gift summary card */}
      <div className="rounded-card border border-hairline bg-ivory overflow-hidden">
        {/* Box header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-hairline bg-cream">
          {boxImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={boxImage} alt={boxName} className="w-10 h-10 rounded-lg object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gold-tint flex items-center justify-center">
              <Gift className="h-5 w-5 text-gold" aria-hidden />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-body text-sm font-semibold text-ink truncate">{boxName}</p>
            <p className="font-body text-xs text-stone tabular-nums">
              Rs. {basePrice.toLocaleString('en-PK')} base
            </p>
          </div>
        </div>

        {/* Items */}
        {items.length > 0 && (
          <div className="px-4 py-3 border-b border-hairline space-y-1.5">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center justify-between gap-2">
                <span className="font-body text-xs text-ink flex-1 min-w-0 truncate">
                  {item.qty > 1 && (
                    <span className="text-gold font-medium mr-1">{item.qty}×</span>
                  )}
                  {item.name}
                </span>
                <span className="font-body text-xs text-stone tabular-nums shrink-0">
                  Rs. {(item.qty * item.unitPrice).toLocaleString('en-PK')}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Personalisation details */}
        {(message.trim() || occasion || ribbonColor) && (
          <div className="px-4 py-3 border-b border-hairline space-y-1.5">
            {occasion && (
              <div className="flex items-center gap-2 text-xs font-body text-stone">
                <Tag className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>{occasion}</span>
              </div>
            )}
            {ribbonColor && (
              <div className="flex items-center gap-2 text-xs font-body text-stone">
                <Ribbon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>{ribbonColor} ribbon</span>
              </div>
            )}
            {message.trim() && (
              <div className="flex items-start gap-2 text-xs font-body text-stone">
                <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden />
                <span className="italic line-clamp-2">&ldquo;{message.trim()}&rdquo;</span>
              </div>
            )}
          </div>
        )}

        {/* Add-ons */}
        {addOns.length > 0 && (
          <div className="px-4 py-3 border-b border-hairline space-y-1.5">
            {addOns.map((ao) => (
              <div key={ao.id} className="flex items-center justify-between gap-2">
                <span className="font-body text-xs text-ink">{ao.name}</span>
                <span className="font-body text-xs text-stone tabular-nums">
                  Rs. {ao.price.toLocaleString('en-PK')}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Price breakdown */}
        <div className="px-4 py-3 space-y-1">
          <div className="flex justify-between font-body text-xs text-stone">
            <span>Box</span>
            <span className="tabular-nums">Rs. {basePrice.toLocaleString('en-PK')}</span>
          </div>
          {itemsTotal > 0 && (
            <div className="flex justify-between font-body text-xs text-stone">
              <span>Items</span>
              <span className="tabular-nums">Rs. {itemsTotal.toLocaleString('en-PK')}</span>
            </div>
          )}
          {addOnsTotal > 0 && (
            <div className="flex justify-between font-body text-xs text-stone">
              <span>Add-ons</span>
              <span className="tabular-nums">Rs. {addOnsTotal.toLocaleString('en-PK')}</span>
            </div>
          )}
          <div className="flex justify-between font-body text-sm font-semibold text-ink border-t border-hairline pt-2 mt-2">
            <span>Gift Total</span>
            <span className="tabular-nums text-gold">
              Rs. {displayTotal.toLocaleString('en-PK')}
            </span>
          </div>
        </div>
      </div>

      {/* Error / price update banner */}
      {error && (
        <div
          className={clsx(
            'flex items-start gap-3 px-4 py-3 rounded-card border text-sm font-body',
            priceUpdated
              ? 'bg-gold-tint border-gold/40 text-ink'
              : 'bg-wine-tint border-wine/30 text-wine'
          )}
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
          <p>{error}</p>
        </div>
      )}

      {/* Add to Cart CTA */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isSubmitting}
        className="w-full h-13 rounded-input bg-wine hover:bg-wine-deep text-ivory font-body font-medium text-[15px] flex items-center justify-center gap-2.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <span className="w-4 h-4 border-2 border-ivory border-t-transparent rounded-full animate-spin" />
            Adding to Cart…
          </>
        ) : (
          <>
            <ShoppingBag className="h-4.5 w-4.5" aria-hidden />
            {priceUpdated ? 'Confirm Updated Price' : 'Add Gift to Cart'}
          </>
        )}
      </button>
    </div>
  )
}
