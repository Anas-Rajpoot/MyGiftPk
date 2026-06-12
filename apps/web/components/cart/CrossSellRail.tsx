'use client'

import Image from 'next/image'
import { Plus, Gift } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart'
import { addToCart } from '@/lib/cart/client'
import { useToastStore } from '@/lib/toast'

const CROSS_SELL_ITEMS = [
  { id: 101, name: 'Greeting Card', price: 'Rs. 150', image: null },
  { id: 102, name: 'Ribbon Wrap', price: 'Rs. 150', image: null },
  { id: 103, name: 'Chocolate Box', price: 'Rs. 350', image: null },
  { id: 104, name: 'Gift Bag', price: 'Rs. 200', image: null },
]

export function CrossSellRail() {
  const setCart = useCartStore((s) => s.setCart)
  const openCart = useCartStore((s) => s.openCart)
  const addToast = useToastStore((s) => s.add)

  async function handleAdd(item: typeof CROSS_SELL_ITEMS[number]) {
    try {
      const cart = await addToCart(item.id)
      setCart(cart)
      openCart()
    } catch {
      addToast(`Couldn't add ${item.name}`, 'error')
    }
  }

  return (
    <div className="px-5 py-4 border-t border-hairline">
      <p className="font-body text-xs uppercase tracking-widest text-stone mb-3">
        <Gift className="inline-block h-3.5 w-3.5 mr-1 align-middle" aria-hidden />Add a little extra
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {CROSS_SELL_ITEMS.map((item) => (
          <div
            key={item.id}
            className="shrink-0 w-24 border border-hairline rounded-card p-2 bg-ivory"
          >
            <div className="relative w-full aspect-square rounded bg-cream overflow-hidden mb-2">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gold-tint" />
              )}
            </div>
            <p className="font-body text-[11px] text-ink leading-tight line-clamp-2 mb-1">{item.name}</p>
            <p className="font-body text-[11px] text-stone mb-2">{item.price}</p>
            <button
              type="button"
              onClick={() => handleAdd(item)}
              aria-label={`Add ${item.name} to cart`}
              className="w-full h-6 flex items-center justify-center gap-1 bg-wine hover:bg-wine-deep text-ivory rounded text-[10px] font-body transition-colors"
            >
              <Plus className="h-3 w-3" aria-hidden />
              Add
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
