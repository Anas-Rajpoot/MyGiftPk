'use client'

import { useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { X, ShoppingBag, Gift } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCartStore } from '@/lib/stores/cart'
import { useToastStore } from '@/lib/toast'
import { fetchCart, updateItemQty, removeItem, clearCart } from '@/lib/cart/client'
import { FreeShippingBar } from '@/components/cart/FreeShippingBar'
import { CartLineItem } from '@/components/cart/CartLineItem'
import { CrossSellRail } from '@/components/cart/CrossSellRail'

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen)
  const closeCart = useCartStore((s) => s.closeCart)
  const cart = useCartStore((s) => s.cart)
  const setCart = useCartStore((s) => s.setCart)
  const isLoading = useCartStore((s) => s.isLoading)
  const setLoading = useCartStore((s) => s.setLoading)
  const optimisticRemove = useCartStore((s) => s.optimisticRemove)
  const optimisticUpdateQty = useCartStore((s) => s.optimisticUpdateQty)
  const optimisticSetGiftWrap = useCartStore((s) => s.optimisticSetGiftWrap)
  const addToast = useToastStore((s) => s.add)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  // Hydrate cart on first open
  useEffect(() => {
    if (isOpen && !cart) {
      setLoading(true)
      fetchCart()
        .then(setCart)
        .catch(() => { setLoading(false) })
    }
  }, [isOpen, cart, setCart, setLoading])

  // Focus close button on open
  useEffect(() => {
    if (isOpen) setTimeout(() => closeBtnRef.current?.focus(), 50)
  }, [isOpen])

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') closeCart()
  }, [closeCart])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKey)
      return () => document.removeEventListener('keydown', handleKey)
    }
  }, [isOpen, handleKey])

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

  async function handleClearCart() {
    if (!cart || cart.items.length === 0) return
    try {
      const updated = await clearCart()
      setCart(updated)
    } catch {
      addToast('Could not clear cart', 'error')
    }
  }

  function handleGiftWrap() {
    optimisticSetGiftWrap(!cart?.giftWrapEnabled)
  }

  const isEmpty = !cart || cart.items.length === 0

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-ink/50"
            aria-hidden
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            role="dialog"
            aria-modal
            aria-label="Shopping cart"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-[400px] bg-ivory shadow-[var(--shadow-float)] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-hairline shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-ink" aria-hidden />
                <h2 className="font-display text-base uppercase tracking-wide text-ink">
                  Your Cart
                </h2>
                {(cart?.itemCount ?? 0) > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-wine text-ivory text-[11px] font-body">
                    {cart!.itemCount}
                  </span>
                )}
                {(cart?.items.length ?? 0) > 0 && (
                  <button
                    type="button"
                    onClick={handleClearCart}
                    className="text-[11px] font-body text-stone hover:text-wine transition-colors underline underline-offset-2 ml-1"
                  >
                    Clear
                  </button>
                )}
              </div>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={closeCart}
                aria-label="Close cart"
                className="w-8 h-8 flex items-center justify-center text-stone hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine rounded"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>

            {/* Free shipping bar */}
            {cart && (
              <FreeShippingBar
                threshold={cart.freeShippingThreshold}
                remaining={cart.freeShippingRemaining}
              />
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {isLoading && !cart && (
                <div className="flex items-center justify-center h-32">
                  <div className="w-6 h-6 border-2 border-wine border-t-transparent rounded-full animate-spin" aria-label="Loading cart" />
                </div>
              )}

              {!isLoading && isEmpty && (
                <div className="flex flex-col items-center justify-center h-full px-8 text-center py-16">
                  <ShoppingBag className="h-12 w-12 text-hairline mb-4" aria-hidden />
                  <p className="font-display text-lg uppercase tracking-wide text-ink mb-2">Your cart is empty</p>
                  <p className="font-body text-sm text-stone mb-6">Add something beautiful to get started.</p>
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="h-11 px-6 bg-wine hover:bg-wine-deep text-ivory font-body font-medium text-sm rounded-input transition-colors inline-flex items-center"
                  >
                    Start Shopping
                  </Link>
                </div>
              )}

              {cart && cart.items.length > 0 && (
                <>
                  <div className="px-5">
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

                  {/* Gift wrap toggle */}
                  <div className="px-5 py-3 border-t border-hairline">
                    <div className="flex items-center justify-between">
                      <span className="font-body text-sm text-ink">
                        <Gift className="inline-block h-4 w-4 mr-1 align-middle" aria-hidden />Gift wrapping
                        <span className="ml-1 text-stone text-xs">(+{cart.giftWrapCost})</span>
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={cart.giftWrapEnabled}
                        onClick={handleGiftWrap}
                        className={`relative w-10 h-5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine ${cart.giftWrapEnabled ? 'bg-wine' : 'bg-hairline'}`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-ivory rounded-full transition-transform ${cart.giftWrapEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                          aria-hidden
                        />
                      </button>
                    </div>
                  </div>

                  {/* Discounts */}
                  {cart.discounts.length > 0 && (
                    <div className="px-5 py-2 border-t border-hairline space-y-1">
                      {cart.discounts.map((d) => (
                        <div key={d.code} className="flex items-center justify-between font-body text-sm">
                          <span className="text-success">🏷 {d.code}</span>
                          <span className="text-success">−{d.amount}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <CrossSellRail />
                </>
              )}
            </div>

            {/* Footer */}
            {cart && cart.items.length > 0 && (
              <div className="shrink-0 border-t border-hairline px-5 py-4 space-y-3 bg-ivory">
                <div className="flex items-center justify-between font-body text-sm">
                  <span className="text-stone">Subtotal</span>
                  <span className="font-semibold text-ink tabular-nums">{cart.subtotal}</span>
                </div>
                {cart.giftWrapEnabled && (
                  <div className="flex items-center justify-between font-body text-sm">
                    <span className="text-stone">Gift wrap</span>
                    <span className="text-ink tabular-nums">{cart.giftWrapCost}</span>
                  </div>
                )}
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full h-12 bg-wine hover:bg-wine-deep text-ivory font-body font-medium text-[15px] rounded-input transition-colors text-center leading-[3rem]"
                >
                  Checkout
                </Link>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="block w-full h-10 border border-hairline hover:border-stone text-stone hover:text-ink font-body text-sm rounded-input transition-colors text-center leading-[2.5rem]"
                >
                  View Cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
