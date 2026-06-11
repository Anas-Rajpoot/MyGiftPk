'use client'

import { Drawer } from '@/components/ui/Drawer'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCartStore } from '@/lib/stores/cart'

export function CartDrawer() {
  const { isOpen, closeCart } = useCartStore()

  return (
    <Drawer isOpen={isOpen} onClose={closeCart} title="Your Cart">
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center p-6">
          <EmptyState
            heading="Your cart is waiting for something lovely."
            description="Browse our collection of clothing and custom gift boxes."
            cta={{ label: 'Shop Now', href: '/shop' }}
          />
        </div>
      </div>
    </Drawer>
  )
}
