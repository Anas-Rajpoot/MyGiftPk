import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface BuilderItem {
  productId: number
  name: string
  image: string | null
  qty: number
  unitPrice: number
}

export interface AddOnItem {
  id: number
  name: string
  price: number
}

interface GiftBuilderState {
  step: 1 | 2 | 3 | 4
  boxId: number | null
  boxName: string
  boxImage: string | null
  basePrice: number
  capacity: number
  items: BuilderItem[]
  message: string
  ribbonColor: string
  addOns: AddOnItem[]
  occasion: string | null

  setStep: (step: 1 | 2 | 3 | 4) => void
  selectBox: (box: { id: number; name: string; image: string | null; basePrice: number; capacity: number }) => void
  addItem: (item: { productId: number; name: string; image: string | null; unitPrice: number }) => void
  removeItem: (productId: number) => void
  updateItemQty: (productId: number, qty: number) => void
  setMessage: (message: string) => void
  setRibbonColor: (color: string) => void
  toggleAddOn: (addon: AddOnItem) => void
  setOccasion: (occasion: string | null) => void
  reset: () => void
}

const INITIAL: Omit<GiftBuilderState, 'setStep' | 'selectBox' | 'addItem' | 'removeItem' | 'updateItemQty' | 'setMessage' | 'setRibbonColor' | 'toggleAddOn' | 'setOccasion' | 'reset'> = {
  step: 1,
  boxId: null,
  boxName: '',
  boxImage: null,
  basePrice: 0,
  capacity: 0,
  items: [],
  message: '',
  ribbonColor: 'Wine Red',
  addOns: [],
  occasion: null,
}

export const useGiftStore = create<GiftBuilderState>()(
  persist(
    (set, get) => ({
      ...INITIAL,

      setStep: (step) => set({ step }),

      selectBox: ({ id, name, image, basePrice, capacity }) => {
        const { items } = get()
        const slotsUsed = items.reduce((s, i) => s + i.qty, 0)
        const trimmedItems = slotsUsed > capacity
          ? items.reduce<BuilderItem[]>((acc, item) => {
              const used = acc.reduce((s, i) => s + i.qty, 0)
              if (used + item.qty <= capacity) return [...acc, item]
              if (used < capacity) return [...acc, { ...item, qty: capacity - used }]
              return acc
            }, [])
          : items
        set({ boxId: id, boxName: name, boxImage: image, basePrice, capacity, items: trimmedItems })
      },

      addItem: ({ productId, name, image, unitPrice }) => {
        const { items, capacity } = get()
        const slotsUsed = items.reduce((s, i) => s + i.qty, 0)
        if (slotsUsed >= capacity) return
        const existing = items.find((i) => i.productId === productId)
        if (existing) {
          set({ items: items.map((i) => i.productId === productId ? { ...i, qty: i.qty + 1 } : i) })
        } else {
          set({ items: [...items, { productId, name, image, qty: 1, unitPrice }] })
        }
      },

      removeItem: (productId) => set({ items: get().items.filter((i) => i.productId !== productId) }),

      updateItemQty: (productId, qty) => {
        if (qty <= 0) {
          set({ items: get().items.filter((i) => i.productId !== productId) })
        } else {
          const { items, capacity } = get()
          const otherSlots = items.filter((i) => i.productId !== productId).reduce((s, i) => s + i.qty, 0)
          const capped = Math.min(qty, capacity - otherSlots)
          set({ items: items.map((i) => i.productId === productId ? { ...i, qty: capped } : i) })
        }
      },

      setMessage: (message) => set({ message }),
      setRibbonColor: (ribbonColor) => set({ ribbonColor }),

      toggleAddOn: (addon) => {
        const { addOns } = get()
        const exists = addOns.some((a) => a.id === addon.id)
        set({ addOns: exists ? addOns.filter((a) => a.id !== addon.id) : [...addOns, addon] })
      },

      setOccasion: (occasion) => set({ occasion }),

      reset: () => set({ ...INITIAL }),
    }),
    {
      name: 'mygift-builder-v1',
      partialize: (state) => ({
        boxId: state.boxId,
        boxName: state.boxName,
        boxImage: state.boxImage,
        basePrice: state.basePrice,
        capacity: state.capacity,
        items: state.items,
        message: state.message,
        ribbonColor: state.ribbonColor,
        addOns: state.addOns,
        occasion: state.occasion,
      }),
    }
  )
)

export const selectSlotsUsed = (s: GiftBuilderState) =>
  s.items.reduce((sum, i) => sum + i.qty, 0)

export const selectDisplayTotal = (s: GiftBuilderState) =>
  s.basePrice +
  s.items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0) +
  s.addOns.reduce((sum, a) => sum + a.price, 0)
