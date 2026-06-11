import { create } from 'zustand'

interface CartStore {
  count: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  setCount: (n: number) => void
}

export const useCartStore = create<CartStore>((set) => ({
  count: 0,
  isOpen: false,
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  setCount: (count) => set({ count }),
}))
