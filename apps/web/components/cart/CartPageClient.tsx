'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, Tag, Shield, Truck, Gift, MapPin } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart'
import { useToastStore } from '@/lib/toast'
import { fetchCart, updateItemQty, removeItem, applyCoupon, removeCoupon } from '@/lib/cart/client'
import { CartLineItem } from './CartLineItem'
import { FreeShippingBar } from './FreeShippingBar'

const TRUST_BADGES = [
  { icon: Truck, text: 'Free shipping over Rs. 3,000' },
  { icon: Shield, text: '100% Authentic products' },
  { icon: Gift, text: 'Gift wrapping available' },
  { icon: MapPin, text: 'Delivered across Pakistan' },
]

export function CartPageClient() {
  const cart = useCartStore((s) => s.cart)
  const setCart = useCartStore((s) => s.setCart)
  const isLoading = useCartStore((s) => s.isLoading)
  const setLoading = useCartStore((s) => s.setLoading)
  const optimisticUpdateQty = useCartStore((s) => s.optimisticUpdateQty)
  const optimisticRemove = useCartStore((s) => s.optimisticRemove)
  const optimisticSetGiftWrap = useCartStore((s) => s.optimisticSetGiftWrap)
  const addToast = useToastStore((s) => s.add)

  const [couponInput, setCouponInput] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [orderNote, setOrderNote] = useState('')

  useEffect(() => {
    if (!cart) {
      setLoading(true)
      fetchCart().then(setCart).catch(() => setLoading(false))
    }
  }, [cart, setCart, setLoading])

  async function handleQtyChange(key: string, qty: number) {
    optimisticUpdateQty(key, qty)
    try {
      const updated = await updateItemQty(key, qty)
      setCart(updated)
    } catch {
      fetchCart().then(setCart).catch(() => null)
      addToast('Could not update quantity', 'error')
    }
  }

  async function handleRemove(key: string) {
    optimisticRemove(key)
    try {
      const updated = await removeItem(key)
      setCart(updated)
    } catch {
      fetchCart().then(setCart).catch(() => null)
      addToast('Could not remove item', 'error')
    }
  }

  async function handleApplyCoupon(e: React.FormEvent) {
    e.preventDefault()
    if (!couponInput.trim()) return
    setCouponLoading(true)
    try {
      const updated = await applyCoupon(couponInput.trim().toUpperCase())
      setCart(updated)
      setCouponInput('')
      addToast('Coupon applied!', 'success')
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Invalid coupon code', 'error')
    } finally {
      setCouponLoading(false)
    }
  }

  async function handleRemoveCoupon(code: string) {
    try {
      const updated = await removeCoupon(code)
      setCart(updated)
    } catch {
      addToast('Could not remove coupon', 'error')
    }
  }

  // Loading skeleton
  if (isLoading && !cart) {
    return (
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-10">
        <div className="h-8 w-48 skeleton-shimmer rounded mb-8" />
        <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-8">
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4 py-4 border-b border-hairline">
                <div className="w-16 h-20 skeleton-shimmer rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 skeleton-shimmer rounded" />
                  <div className="h-3 w-1/2 skeleton-shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const isEmpty = !cart || cart.items.length === 0

  return (
    <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl sm:text-3xl uppercase tracking-wide text-ink mb-8">
        Shopping Cart
        {!isEmpty && (
          <span className="ml-3 font-body text-base font-normal text-stone normal-case tracking-normal">
            {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
          </span>
        )}
      </h1>

      {isEmpty ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingBag className="h-16 w-16 text-hairline mb-5" aria-hidden />
          <h2 className="font-display text-xl uppercase tracking-wide text-ink mb-2">Your cart is empty</h2>
          <p className="font-body text-sm text-stone mb-8 max-w-sm">
            Looks like you haven&apos;t added anything yet. Explore our collection of clothing and custom gift boxes.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/shop"
              className="h-12 px-6 bg-wine hover:bg-wine-deep text-ivory font-body font-medium text-sm rounded-input transition-colors inline-flex items-center"
            >
              Shop Clothing
            </Link>
            <Link
              href="/gift-builder"
              className="h-12 px-6 border border-wine text-wine hover:bg-wine-tint font-body font-medium text-sm rounded-input transition-colors inline-flex items-center"
            >
              Build a Gift
            </Link>
          </div>
        </div>
      ) : (
        <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-10">
          {/* Left: items + order note */}
          <div>
            {/* Free shipping bar */}
            <div className="mb-4 -mx-4 sm:mx-0 border border-hairline rounded-card overflow-hidden">
              <FreeShippingBar
                threshold={cart.freeShippingThreshold}
                remaining={cart.freeShippingRemaining}
              />
            </div>

            {/* Items */}
            <div className="border border-hairline rounded-card overflow-hidden">
              <div className="divide-y divide-hairline px-5">
                {cart.items.map((item) => (
                  <CartLineItem
                    key={item.key}
                    item={item}
                    onQtyChange={handleQtyChange}
                    onRemove={handleRemove}
                    isLoading={isLoading}
                  />
                ))}
              </div>
            </div>

            {/* Discounts applied */}
            {cart.discounts.length > 0 && (
              <div className="mt-4 space-y-2">
                {cart.discounts.map((d) => (
                  <div key={d.code} className="flex items-center justify-between px-4 py-2 bg-success-tint border border-success-border rounded-input">
                    <span className="font-body text-sm text-success font-medium">🏷 {d.code} — −{d.amount}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCoupon(d.code)}
                      className="font-body text-xs text-stone hover:text-wine transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Order note */}
            <div className="mt-6">
              <label htmlFor="order-note" className="block font-body text-sm text-ink font-medium mb-2">
                Order note <span className="text-stone font-normal">(optional)</span>
              </label>
              <textarea
                id="order-note"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                rows={3}
                placeholder="Special instructions, delivery details…"
                className="w-full rounded-input border border-hairline bg-ivory px-4 py-3 font-body text-sm text-ink placeholder:text-stone focus:outline-none focus:ring-2 focus:ring-wine resize-none"
              />
            </div>

            {/* Trust badges */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TRUST_BADGES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 p-3 border border-hairline rounded-card">
                  <Icon className="h-4 w-4 text-wine shrink-0" aria-hidden />
                  <span className="font-body text-xs text-stone">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: order summary */}
          <div className="mt-8 lg:mt-0">
            <div className="border border-hairline rounded-card p-5 space-y-4 sticky top-24">
              <h2 className="font-display text-base uppercase tracking-wide text-ink">Order Summary</h2>

              {/* Coupon */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="flex-1 relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone pointer-events-none" aria-hidden />
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="COUPON CODE"
                    className="w-full h-10 pl-9 pr-3 rounded-input border border-hairline bg-ivory font-body text-sm text-ink placeholder:text-stone focus:outline-none focus:ring-2 focus:ring-wine uppercase tracking-wider"
                    aria-label="Coupon code"
                  />
                </div>
                <button
                  type="submit"
                  disabled={couponLoading || !couponInput.trim()}
                  className="h-10 px-4 bg-ink hover:bg-ink/80 text-ivory font-body text-sm rounded-input transition-colors disabled:opacity-50 shrink-0"
                >
                  {couponLoading ? '…' : 'Apply'}
                </button>
              </form>

              {/* Totals */}
              <div className="space-y-2 pt-2 border-t border-hairline">
                <div className="flex justify-between font-body text-sm">
                  <span className="text-stone">Subtotal</span>
                  <span className="text-ink font-medium tabular-nums">{cart.subtotal}</span>
                </div>
                {cart.discounts.map((d) => (
                  <div key={d.code} className="flex justify-between font-body text-sm">
                    <span className="text-success">Discount ({d.code})</span>
                    <span className="text-success tabular-nums">−{d.amount}</span>
                  </div>
                ))}
                {cart.giftWrapEnabled && (
                  <div className="flex justify-between font-body text-sm">
                    <span className="text-stone">Gift wrap</span>
                    <span className="text-ink tabular-nums">{cart.giftWrapCost}</span>
                  </div>
                )}
                <div className="flex justify-between font-body text-sm text-stone italic">
                  <span>Shipping</span>
                  <span>{cart.freeShippingRemaining === 0 ? 'Free' : 'Calculated at checkout'}</span>
                </div>
              </div>

              {/* Gift wrap toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-hairline">
                <span className="font-body text-sm text-ink">
                  🎁 Gift wrapping
                  <span className="ml-1 text-stone text-xs">(+{cart.giftWrapCost})</span>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={cart.giftWrapEnabled}
                  onClick={() => optimisticSetGiftWrap(!cart.giftWrapEnabled)}
                  className={`relative w-10 h-5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine ${cart.giftWrapEnabled ? 'bg-wine' : 'bg-hairline'}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-ivory rounded-full transition-transform ${cart.giftWrapEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                    aria-hidden
                  />
                </button>
              </div>

              {/* Total */}
              <div className="flex justify-between items-baseline pt-3 border-t border-hairline">
                <span className="font-display text-base uppercase tracking-wide text-ink">Total</span>
                <span className="font-display text-xl text-ink tabular-nums">{cart.total}</span>
              </div>

              <Link
                href="/checkout"
                className="block w-full h-12 bg-wine hover:bg-wine-deep text-ivory font-body font-medium text-[15px] rounded-input transition-colors text-center leading-[3rem]"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/shop"
                className="block text-center font-body text-sm text-stone hover:text-wine transition-colors"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
