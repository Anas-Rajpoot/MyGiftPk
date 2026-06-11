import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WishlistItem {
  slug: string
  name: string
  price: string
  salePrice?: string
  image?: { sourceUrl: string; altText: string }
}

interface WishlistStore {
  items: WishlistItem[]
  isWishlisted: (slug: string) => boolean
  toggle: (item: WishlistItem) => void
  remove: (slug: string) => void
  clear: () => void
  // Shareable link helpers
  getShareableSlugList: () => string
  loadFromSlugList: (slugs: string) => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      isWishlisted: (slug) => get().items.some((i) => i.slug === slug),

      toggle: (item) => {
        const { items } = get()
        const exists = items.some((i) => i.slug === item.slug)
        set({ items: exists ? items.filter((i) => i.slug !== item.slug) : [...items, item] })
      },

      remove: (slug) => set({ items: get().items.filter((i) => i.slug !== slug) }),

      clear: () => set({ items: [] }),

      getShareableSlugList: () =>
        get().items.map((i) => i.slug).join(','),

      loadFromSlugList: (slugs) => {
        const existing = get().items
        const existingSlugs = new Set(existing.map((i) => i.slug))
        const newSlugs = slugs.split(',').filter((s) => s && !existingSlugs.has(s))
        if (newSlugs.length === 0) return
        const stubs: WishlistItem[] = newSlugs.map((slug) => ({
          slug,
          name: slug.replace(/-/g, ' '),
          price: '',
        }))
        set({ items: [...existing, ...stubs] })
      },
    }),
    {
      name: 'mygift-wishlist',
      version: 1,
    }
  )
)
