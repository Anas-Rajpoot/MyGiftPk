'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { clsx } from 'clsx'
import { Heart, Eye, ShoppingBag } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

interface ProductImage {
  src: string
  alt: string
}

interface ProductCardProps {
  slug: string
  name: string
  price: string
  salePrice?: string
  image?: ProductImage
  hoverImage?: ProductImage
  badge?: 'sale' | 'new' | 'gift'
  onQuickView?: () => void
  onWishlist?: () => void
  onAddToCart?: () => void
  isWishlisted?: boolean
  isAddingToCart?: boolean
  className?: string
}

export function ProductCard({
  slug,
  name,
  price,
  salePrice,
  image,
  hoverImage,
  badge,
  onQuickView,
  onWishlist,
  onAddToCart,
  isWishlisted = false,
  isAddingToCart = false,
  className,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false)
  const href = `/product/${slug}`

  return (
    <article
      className={clsx('group relative', className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Image area ─────────────────────────── */}
      <div className="relative aspect-[3/4] bg-cream rounded-card overflow-hidden">
        {/* Badge */}
        {badge && (
          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <Badge variant={badge} />
          </div>
        )}

        {/* Primary image */}
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={clsx(
              'object-cover transition-opacity duration-[250ms]',
              hovered && hoverImage ? 'opacity-0' : 'opacity-100'
            )}
          />
        ) : (
          <div className="absolute inset-0 bg-wine-tint" aria-hidden />
        )}

        {/* Hover image crossfade */}
        {hoverImage && (
          <Image
            src={hoverImage.src}
            alt={hoverImage.alt}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={clsx(
              'object-cover transition-opacity duration-[250ms]',
              hovered ? 'opacity-100' : 'opacity-0'
            )}
          />
        )}

        {/* Quick-action bar — slides up on hover (always visible on mobile) */}
        <div
          className={clsx(
            'absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2.5',
            'bg-ivory/90 backdrop-blur-sm border-t border-hairline',
            // Desktop: hidden until hover
            'sm:transition-transform sm:duration-200',
            'sm:translate-y-full sm:group-hover:translate-y-0',
            // Mobile: always visible (small icons)
            'translate-y-0'
          )}
        >
          {/* Quick View */}
          <button
            type="button"
            onClick={onQuickView}
            aria-label={`Quick view ${name}`}
            className="flex items-center gap-1.5 text-xs font-body font-medium text-stone hover:text-wine transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wine rounded"
          >
            <Eye className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Quick View</span>
          </button>

          {/* Wishlist */}
          <button
            type="button"
            onClick={onWishlist}
            aria-label={isWishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
            aria-pressed={isWishlisted}
            className="p-1.5 rounded text-stone hover:text-wine transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wine"
          >
            <Heart
              className={clsx('h-4 w-4', isWishlisted && 'fill-wine text-wine')}
              aria-hidden
            />
          </button>

          {/* Add to Cart */}
          <button
            type="button"
            onClick={onAddToCart}
            disabled={isAddingToCart}
            aria-label={`Add ${name} to cart`}
            aria-busy={isAddingToCart}
            className="flex items-center gap-1.5 text-xs font-body font-semibold text-wine hover:text-wine-deep transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wine rounded disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isAddingToCart ? (
              <span className="h-4 w-4 border-2 border-wine border-t-transparent rounded-full animate-spin" aria-hidden />
            ) : (
              <ShoppingBag className="h-4 w-4" aria-hidden />
            )}
            <span className="hidden sm:inline">{isAddingToCart ? '…' : 'Add'}</span>
          </button>
        </div>
      </div>

      {/* ── Info area ──────────────────────────── */}
      <div className="mt-3 px-0.5">
        {/* Stretched link — covers the whole card */}
        <Link
          href={href}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2 rounded"
        >
          <span className="font-body font-medium text-ink text-sm leading-snug line-clamp-2 hover:text-wine transition-colors">
            {name}
          </span>
        </Link>

        <div className="mt-1 flex items-baseline gap-2">
          {salePrice ? (
            <>
              <span className="font-body font-semibold text-wine text-base tabular-nums">
                {salePrice}
              </span>
              <span className="font-body text-stone text-sm line-through tabular-nums">
                {price}
              </span>
            </>
          ) : (
            <span className="font-body font-semibold text-ink text-base tabular-nums">
              {price}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
