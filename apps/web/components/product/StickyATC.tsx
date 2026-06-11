'use client'

import { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import type { ProductFull } from '@/lib/wp/queries/shop'
import { useCartStore } from '@/lib/stores/cart'
import { useToastStore } from '@/lib/toast'
import { addToCart } from '@/lib/cart/client'

interface StickyATCProps {
  product: ProductFull
  /** Ref to the main ATC section — bar hides while it's visible */
  actionsRef: React.RefObject<HTMLDivElement | null>
}

export function StickyATC({ product, actionsRef }: StickyATCProps) {
  const [visible, setVisible] = useState(false)
  const openCart = useCartStore((s) => s.openCart)
  const setCart = useCartStore((s) => s.setCart)
  const addToast = useToastStore((s) => s.add)

  useEffect(() => {
    const el = actionsRef.current as HTMLElement | null
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-72px 0px 0px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [actionsRef])

  async function handleQuickAdd() {
    if (product.stockStatus !== 'IN_STOCK') return
    try {
      const cart = await addToCart(product.databaseId)
      setCart(cart)
      openCart()
    } catch {
      addToast(`Couldn't add ${product.name} to cart`, 'error')
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="sticky-atc"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-ivory border-t border-hairline px-4 py-3 safe-area-inset-bottom"
        >
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <div className="flex-1 min-w-0">
              <p className="font-body text-sm font-medium text-ink truncate">{product.name}</p>
              <p className="font-display text-base text-wine">
                {product.salePrice ?? product.price}
              </p>
            </div>
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={product.stockStatus !== 'IN_STOCK'}
              className={clsx(
                'shrink-0 h-11 px-6 rounded-input font-body font-medium text-sm transition-colors',
                product.stockStatus === 'IN_STOCK'
                  ? 'bg-wine hover:bg-wine-deep text-ivory'
                  : 'bg-hairline text-stone cursor-not-allowed'
              )}
            >
              {product.stockStatus === 'IN_STOCK' ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
