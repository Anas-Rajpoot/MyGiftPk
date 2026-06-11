'use client'

import { ProductCard } from './ProductCard'
import { toast } from '@/lib/toast'
import { useCartStore } from '@/lib/stores/cart'
import type { ProductNode } from '@/lib/wp/queries/products'

interface ProductCardGridProps {
  products: ProductNode[]
  columns?: 2 | 4
}

export function ProductCardGrid({ products, columns = 4 }: ProductCardGridProps) {
  const { openCart } = useCartStore()

  return (
    <div
      className={
        columns === 2
          ? 'grid grid-cols-2 gap-4 sm:gap-6'
          : 'grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6'
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
          onAddToCart={() => {
            toast.success(`${p.name} added to cart`)
            openCart()
          }}
          onWishlist={() => toast.info(`${p.name} saved to wishlist`)}
          onQuickView={() => toast.info(`Quick view: ${p.name}`)}
        />
      ))}
    </div>
  )
}
