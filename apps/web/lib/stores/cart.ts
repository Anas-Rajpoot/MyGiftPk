import { create } from 'zustand'
import type { CartData, CartLineItem } from '@/lib/cart/normalize'

interface CartStore {
  cart: CartData | null
  isOpen: boolean
  isLoading: boolean
  // Derived from cart for convenience
  count: number

  // UI controls
  openCart: () => void
  closeCart: () => void

  // Set cart from API response
  setCart: (cart: CartData) => void

  // Optimistic helpers — apply instantly, caller must reconcile with API
  optimisticAdd: (item: CartLineItem) => void
  optimisticRemove: (key: string) => void
  optimisticUpdateQty: (key: string, qty: number) => void
  optimisticSetGiftWrap: (enabled: boolean) => void

  // Loading state
  setLoading: (v: boolean) => void
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: null,
  isOpen: false,
  isLoading: false,
  count: 0,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  setCart: (cart) => set({ cart, count: cart.itemCount, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),

  optimisticAdd: (item) => {
    const { cart } = get()
    if (!cart) return
    const existing = cart.items.find((i) => i.key === item.key)
    const items = existing
      ? cart.items.map((i) => i.key === item.key ? { ...i, quantity: i.quantity + item.quantity } : i)
      : [...cart.items, item]
    const count = items.reduce((s, i) => s + i.quantity, 0)
    set({ cart: { ...cart, items, itemCount: count }, count })
  },

  optimisticRemove: (key) => {
    const { cart } = get()
    if (!cart) return
    const items = cart.items.filter((i) => i.key !== key)
    const count = items.reduce((s, i) => s + i.quantity, 0)
    set({ cart: { ...cart, items, itemCount: count }, count })
  },

  optimisticUpdateQty: (key, qty) => {
    const { cart } = get()
    if (!cart) return
    const items = qty === 0
      ? cart.items.filter((i) => i.key !== key)
      : cart.items.map((i) => i.key === key ? { ...i, quantity: qty } : i)
    const count = items.reduce((s, i) => s + i.quantity, 0)
    set({ cart: { ...cart, items, itemCount: count }, count })
  },

  optimisticSetGiftWrap: (enabled) => {
    const { cart } = get()
    if (!cart) return
    set({ cart: { ...cart, giftWrapEnabled: enabled } })
  },
}))

// Convenience selector
export const selectCartCount = (s: CartStore) => s.count
