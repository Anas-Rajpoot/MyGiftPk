'use client'

import { useSyncExternalStore, useMemo, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ProductCard } from './ProductCard'
import { toast } from '@/lib/toast'
import { useCartStore } from '@/lib/stores/cart'
import { useWishlistStore } from '@/lib/stores/wishlist'
import { addToCart } from '@/lib/cart/client'
import type { ProductNode } from '@/lib/wp/queries/products'

interface ProductCardGridProps {
  products: ProductNode[]
  columns?: 2 | 3 | 4
}

export function ProductCardGrid({ products, columns = 4 }: ProductCardGridProps) {
  const router = useRouter()
  const setCart = useCartStore((s) => s.setCart)
  const openCart = useCartStore((s) => s.openCart)
  const toggle = useWishlistStore((s) => s.toggle)
  const [addingId, setAddingId] = useState<number | null>(null)
  // Ref-based guard: synchronous check prevents duplicate calls
  // even if React hasn't re-rendered between two rapid clicks
  const inFlightRef = useRef(false)

  // useSyncExternalStore: server snapshot returns '' so SSR always renders
  // un-wishlisted, avoiding hydration mismatch with localStorage.
  const slugsStr = useSyncExternalStore(
    (cb) => useWishlistStore.subscribe(cb),
    () => useWishlistStore.getState().items.map((i) => i.slug).join(','),
    () => ''
  )
  const wishlistSet = useMemo(
    () => new Set(slugsStr ? slugsStr.split(',') : []),
    [slugsStr]
  )

  async function handleAddToCart(p: ProductNode) {
    if (p.type === 'VARIABLE') {
      // Use hard navigation so the @modal/(.)product parallel route does NOT
      // intercept — the user lands on the full PDP to pick their variant.
      window.location.assign(`/product/${p.slug}`)
      return
    }
    // Synchronous guard: prevents multiple in-flight add-to-cart requests
    if (inFlightRef.current) return
    inFlightRef.current = true
    setAddingId(p.databaseId)
    try {
      const cart = await addToCart(p.databaseId)
      setCart(cart)
      openCart()
    } catch {
      toast.error(`Couldn't add ${p.name} to cart`)
    } finally {
      inFlightRef.current = false
      setAddingId(null)
    }
  }

  return (
    <div
      className={
        columns === 2
          ? 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'
          : columns === 3
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
          : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6'
      }
    >
      {products.map((p) => (
        <ProductCard
          key={p.id}
          slug={p.slug}
          name={p.name}
          price={p.price}
          salePrice={p.salePrice ?? undefined}
          badge={p.onSale ? 'sale' : undefined}
          image={p.image ? { src: p.image.sourceUrl, alt: p.image.altText } : undefined}
          isWishlisted={wishlistSet.has(p.slug)}
          isAddingToCart={addingId === p.databaseId}
          onAddToCart={() => handleAddToCart(p)}
          onWishlist={() => {
            toggle({ slug: p.slug, name: p.name, price: p.price, salePrice: p.salePrice ?? undefined, image: p.image ?? undefined })
          }}
          onQuickView={() => router.push(`/product/${p.slug}`)}
        />
      ))}
    </div>
  )
}
