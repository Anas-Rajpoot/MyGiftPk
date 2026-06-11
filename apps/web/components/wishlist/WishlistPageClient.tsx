'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Share2, X, ShoppingBag } from 'lucide-react'
import { useWishlistStore } from '@/lib/stores/wishlist'
import { useToastStore } from '@/lib/toast'

export function WishlistPageClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const items = useWishlistStore((s) => s.items)
  const remove = useWishlistStore((s) => s.remove)
  const getShareableSlugList = useWishlistStore((s) => s.getShareableSlugList)
  const loadFromSlugList = useWishlistStore((s) => s.loadFromSlugList)
  const addToast = useToastStore((s) => s.add)
  const [shareLabel, setShareLabel] = useState('Share Wishlist')

  // Load shared wishlist from URL ?items=slug1,slug2
  useEffect(() => {
    const shared = searchParams.get('items')
    if (shared) {
      loadFromSlugList(shared)
      router.replace('/wishlist', { scroll: false })
    }
  }, [searchParams, loadFromSlugList, router])

  async function handleShare() {
    const slugs = getShareableSlugList()
    if (!slugs) return
    const url = `${window.location.origin}/wishlist?items=${slugs}`
    try {
      await navigator.clipboard.writeText(url)
      setShareLabel('Link copied!')
      setTimeout(() => setShareLabel('Share Wishlist'), 2500)
    } catch {
      addToast('Could not copy link', 'error')
    }
  }

  async function handleAddToCart(slug: string, name: string) {
    try {
      // We only have slug — use MOCK_MODE path or navigate to product for variations
      router.push(`/product/${slug}`)
    } catch {
      addToast(`Couldn't add ${name}`, 'error')
    }
  }

  return (
    <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-4">
        <h1 className="font-display text-2xl sm:text-3xl uppercase tracking-wide text-ink">
          Wishlist
          {items.length > 0 && (
            <span className="ml-3 font-body text-base font-normal text-stone normal-case tracking-normal">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </h1>
        {items.length > 0 && (
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-2 h-10 px-4 border border-hairline rounded-input font-body text-sm text-stone hover:border-wine hover:text-wine transition-colors"
          >
            <Share2 className="h-4 w-4" aria-hidden />
            {shareLabel}
          </button>
        )}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart className="h-16 w-16 text-hairline mb-5" aria-hidden />
          <h2 className="font-display text-xl uppercase tracking-wide text-ink mb-2">Your wishlist is empty</h2>
          <p className="font-body text-sm text-stone mb-8 max-w-sm">
            Save items you love by tapping the heart icon on any product.
          </p>
          <Link
            href="/shop"
            className="h-12 px-6 bg-wine hover:bg-wine-deep text-ivory font-body font-medium text-sm rounded-input transition-colors inline-flex items-center"
          >
            Start Browsing
          </Link>
        </div>
      )}

      {/* Grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item) => (
            <article key={item.slug} className="group relative">
              {/* Remove button */}
              <button
                type="button"
                onClick={() => remove(item.slug)}
                aria-label={`Remove ${item.name} from wishlist`}
                className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center bg-ivory/80 hover:bg-ivory rounded-full text-stone hover:text-wine transition-colors"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>

              {/* Image */}
              <Link href={`/product/${item.slug}`}>
                <div className="relative aspect-[3/4] rounded-card overflow-hidden bg-cream">
                  {item.image ? (
                    <Image
                      src={item.image.sourceUrl}
                      alt={item.image.altText || item.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-wine-tint" />
                  )}
                </div>
              </Link>

              {/* Info */}
              <div className="mt-3 space-y-1">
                <Link
                  href={`/product/${item.slug}`}
                  className="block font-body text-sm font-medium text-ink hover:text-wine transition-colors line-clamp-2 leading-snug"
                >
                  {item.name}
                </Link>
                {item.price && (
                  <div className="flex items-baseline gap-1.5">
                    {item.salePrice ? (
                      <>
                        <span className="font-body font-semibold text-wine text-sm tabular-nums">{item.salePrice}</span>
                        <span className="font-body text-stone text-xs line-through tabular-nums">{item.price}</span>
                      </>
                    ) : (
                      <span className="font-body font-semibold text-ink text-sm tabular-nums">{item.price}</span>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handleAddToCart(item.slug, item.name)}
                  className="flex items-center gap-1.5 text-xs font-body font-medium text-wine hover:text-wine-deep transition-colors mt-2"
                >
                  <ShoppingBag className="h-3.5 w-3.5" aria-hidden />
                  Add to Cart
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
