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

        {/* Wishlist button — always accessible, top-right */}
        <button
          type="button"
          onClick={onWishlist}
          aria-label={isWishlisted ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
          aria-pressed={isWishlisted}
          className={clsx(
            'absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200',
            'bg-ivory/80 hover:bg-ivory backdrop-blur-sm shadow-sm',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine',
            // On desktop hide until hover, always show on mobile
            'opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-y-1 sm:group-hover:translate-y-0'
          )}
        >
          <Heart
            className={clsx(
              'h-3.5 w-3.5 transition-colors',
              isWishlisted ? 'fill-wine text-wine' : 'text-stone'
            )}
            aria-hidden
          />
        </button>

        {/* Primary image */}
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) 50vw, 25vw"
            className={clsx(
              'object-cover transition-all duration-500',
              hovered && hoverImage ? 'opacity-0 scale-[1.03]' : 'opacity-100 scale-100'
            )}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-wine-tint via-cream to-ivory" aria-hidden />
        )}

        {/* Hover image crossfade */}
        {hoverImage && (
          <Image
            src={hoverImage.src}
            alt={hoverImage.alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={clsx(
              'object-cover transition-all duration-500',
              hovered ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.03]'
            )}
          />
        )}

        {/* Desktop hover overlay — hidden on mobile */}
        <div
          className={clsx(
            'absolute inset-x-0 bottom-0 hidden sm:flex flex-col',
            'transition-all duration-300 ease-out',
            'before:absolute before:inset-0 before:bg-gradient-to-t before:from-ink/40 before:to-transparent before:pointer-events-none',
            'sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100'
          )}
        >
          <div className="relative z-10 flex items-center gap-1 px-3 py-2.5">
            <button
              type="button"
              onClick={onQuickView}
              aria-label={`Quick view ${name}`}
              className="flex items-center gap-1.5 flex-1 justify-center h-9 rounded-input bg-ivory/95 hover:bg-ivory text-ink text-xs font-body font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wine shadow-sm"
            >
              <Eye className="h-3.5 w-3.5" aria-hidden />
              Quick View
            </button>
            <button
              type="button"
              onClick={onAddToCart}
              disabled={isAddingToCart}
              aria-label={`Add ${name} to cart`}
              aria-busy={isAddingToCart}
              className="flex items-center gap-1.5 flex-1 justify-center h-9 rounded-input bg-wine hover:bg-wine-deep text-ivory text-xs font-body font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wine shadow-sm disabled:opacity-60"
            >
              {isAddingToCart ? (
                <span className="h-3.5 w-3.5 border-2 border-ivory/60 border-t-ivory rounded-full animate-spin" aria-hidden />
              ) : (
                <ShoppingBag className="h-3.5 w-3.5" aria-hidden />
              )}
              {isAddingToCart ? 'Adding…' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Info area ──────────────────────────── */}
      <div className="mt-3 px-0.5">
        <Link
          href={href}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-1 rounded"
        >
          <span className="font-body font-medium text-ink text-sm sm:text-[13px] leading-snug line-clamp-2 hover:text-wine transition-colors duration-150">
            {name}
          </span>
        </Link>

        <div className="mt-1.5 flex items-baseline gap-2">
          {salePrice ? (
            <>
              <span className="font-body font-bold text-wine text-base sm:text-[15px] tabular-nums">
                {salePrice}
              </span>
              <span className="font-body text-stone text-xs sm:text-sm line-through tabular-nums">
                {price}
              </span>
            </>
          ) : (
            <span className="font-body font-semibold text-ink text-base sm:text-[15px] tabular-nums">
              {price}
            </span>
          )}
        </div>

        {/* Mobile-only Add to Cart button */}
        <div className="mt-3 sm:hidden">
          <button
            type="button"
            onClick={onAddToCart}
            disabled={isAddingToCart}
            aria-label={`Add ${name} to cart`}
            aria-busy={isAddingToCart}
            className="w-full h-10 flex items-center justify-center gap-2 bg-wine hover:bg-wine-deep active:bg-wine-deep text-ivory text-xs font-body font-semibold rounded-input transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-1 disabled:opacity-60"
          >
            {isAddingToCart ? (
              <span className="h-3.5 w-3.5 border-2 border-ivory/60 border-t-ivory rounded-full animate-spin" aria-hidden />
            ) : (
              <ShoppingBag className="h-3.5 w-3.5" aria-hidden />
            )}
            {isAddingToCart ? 'Adding…' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  )
}
