'use client'

import { useState, useMemo, useSyncExternalStore } from 'react'
import { Heart, MessageCircle, Info } from 'lucide-react'
import { clsx } from 'clsx'
import { useCartStore } from '@/lib/stores/cart'
import { useWishlistStore } from '@/lib/stores/wishlist'
import { useToastStore } from '@/lib/toast'
import { addToCart } from '@/lib/cart/client'
import { QtyStepper } from '@/components/ui/QtyStepper'
import type { ProductFull, ProductVariation } from '@/lib/wp/queries/shop'

interface ProductActionsProps {
  product: ProductFull
  onSizeGuide?: () => void
}

function findVariation(
  variations: ProductVariation[],
  type: string | null,
  size: string | null
): ProductVariation | null {
  if (!type && !size) return null
  return (
    variations.find((v) => {
      const attrs = Object.fromEntries(v.attributes.nodes.map((a) => [a.name.replace('attribute_pa_', ''), a.value.toLowerCase()]))
      return (!type || attrs.type === type) && (!size || attrs.size === size)
    }) ?? null
  )
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export function ProductActions({ product, onSizeGuide }: ProductActionsProps) {
  const isVariable = product.type === 'VARIABLE'
  const variations = useMemo(() => product.variations?.nodes ?? [], [product.variations])

  // Get unique attribute values from variations
  const types = useMemo(() => {
    const set = new Set<string>()
    variations.forEach((v) =>
      v.attributes.nodes.forEach((a) => {
        if (a.name.includes('pa_type')) set.add(a.value)
      })
    )
    return [...set]
  }, [variations])

  const sizes = useMemo(() => {
    const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    const set = new Set<string>()
    variations.forEach((v) =>
      v.attributes.nodes.forEach((a) => {
        if (a.name.includes('pa_size')) set.add(a.value)
      })
    )
    return [...set].sort((a, b) => order.indexOf(a) - order.indexOf(b))
  }, [variations])

  const [selectedType, setSelectedType] = useState<string | null>(types[0] ?? null)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  const selectedVariation = isVariable
    ? findVariation(variations, selectedType?.toLowerCase() ?? null, selectedSize?.toLowerCase() ?? null)
    : null

  const canAddToCart = isVariable ? !!selectedVariation && selectedVariation.stockStatus === 'IN_STOCK' : product.stockStatus === 'IN_STOCK'
  const displayPrice = selectedVariation?.salePrice ?? selectedVariation?.price ?? product.salePrice ?? product.price
  const displayRegular = selectedVariation?.regularPrice ?? product.regularPrice
  const onSale = !!(selectedVariation?.salePrice ?? product.salePrice)
  const stockStatus = selectedVariation?.stockStatus ?? product.stockStatus

  const openCart = useCartStore((s) => s.openCart)
  const setCart = useCartStore((s) => s.setCart)
  const toggleWishlist = useWishlistStore((s) => s.toggle)
  // Server snapshot → false avoids hydration mismatch with localStorage state.
  const isWishlisted = useSyncExternalStore(
    (cb) => useWishlistStore.subscribe(cb),
    () => useWishlistStore.getState().isWishlisted(product.slug),
    () => false
  )
  const addToast = useToastStore((s) => s.add)

  async function handleAddToCart() {
    if (!canAddToCart || isAdding) return
    setIsAdding(true)
    try {
      const cart = await addToCart(
        product.databaseId,
        selectedVariation?.databaseId ?? null,
        qty
      )
      setCart(cart)
      openCart()
    } catch (e) {
      addToast(e instanceof Error ? e.message : 'Could not add to cart', 'error')
    } finally {
      setIsAdding(false)
    }
  }

  function handleWishlist() {
    toggleWishlist({
      slug: product.slug,
      name: product.name,
      price: product.price,
      salePrice: product.salePrice ?? undefined,
      image: product.image ?? undefined,
    })
    addToast(isWishlisted ? 'Removed from wishlist' : 'Saved to wishlist', 'info')
  }

  const whatsappMsg = encodeURIComponent(
    `Hi, I'm interested in: ${product.name}${selectedType ? ` (${selectedType}` : ''}${selectedSize ? `, ${selectedSize})` : selectedType ? ')' : ''}`
  )
  const whatsappUrl = `https://wa.me/923000000000?text=${whatsappMsg}`

  return (
    <div className="space-y-5">
      {/* Price */}
      <div className="flex items-baseline gap-2">
        <span className={clsx('font-display text-2xl sm:text-3xl', onSale ? 'text-wine' : 'text-ink')}>
          {displayPrice}
        </span>
        {onSale && (
          <span className="font-body text-base text-stone line-through">{displayRegular}</span>
        )}
      </div>

      {/* Short description */}
      {product.shortDescription && (
        <p className="font-body text-sm text-stone leading-relaxed">
          {stripHtml(product.shortDescription)}
        </p>
      )}

      {/* Type selector */}
      {isVariable && types.length > 0 && (
        <div className="space-y-2">
          <p className="font-body text-sm text-ink font-medium">
            Type: <span className="text-stone font-normal">{selectedType ?? 'Select'}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {types.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedType(t)}
                aria-pressed={selectedType === t}
                className={clsx(
                  'h-9 px-4 rounded-input border text-sm font-body transition-colors',
                  selectedType === t
                    ? 'border-wine bg-wine text-ivory'
                    : 'border-hairline bg-ivory text-ink hover:border-stone'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size selector */}
      {isVariable && sizes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-body text-sm text-ink font-medium">
              Size: <span className="text-stone font-normal">{selectedSize ?? 'Select'}</span>
            </p>
            {onSizeGuide && (
              <button
                type="button"
                onClick={onSizeGuide}
                className="flex items-center gap-1 text-[13px] text-stone hover:text-wine transition-colors"
              >
                <Info className="h-3.5 w-3.5" aria-hidden />
                Size Guide
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => {
              const variation = findVariation(variations, selectedType?.toLowerCase() ?? null, s.toLowerCase())
              const outOfStock = variation?.stockStatus === 'OUT_OF_STOCK'
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => !outOfStock && setSelectedSize(s)}
                  aria-pressed={selectedSize === s}
                  disabled={outOfStock}
                  className={clsx(
                    'relative h-9 w-12 rounded-input border text-sm font-body transition-colors',
                    selectedSize === s
                      ? 'border-wine bg-wine text-ivory'
                      : outOfStock
                      ? 'border-hairline text-stone cursor-not-allowed'
                      : 'border-hairline bg-ivory text-ink hover:border-stone'
                  )}
                >
                  {s}
                  {outOfStock && (
                    <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
                      <span className="w-full h-px bg-stone/50 rotate-45 absolute" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Stock status */}
      {isVariable && selectedVariation && (
        <p className={clsx('font-body text-sm', stockStatus === 'IN_STOCK' ? 'text-success' : 'text-wine')}>
          {stockStatus === 'IN_STOCK' ? 'In Stock' : 'Out of Stock'}
        </p>
      )}

      {/* Qty + ATC */}
      <div className="flex items-center gap-3">
        <QtyStepper value={qty} onChange={setQty} min={1} max={10} />
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!canAddToCart || isAdding}
          aria-busy={isAdding}
          className={clsx(
            'flex-1 h-12 rounded-input font-body font-medium text-[15px] transition-colors flex items-center justify-center gap-2',
            canAddToCart && !isAdding
              ? 'bg-wine hover:bg-wine-deep text-ivory'
              : 'bg-hairline text-stone cursor-not-allowed'
          )}
        >
          {isAdding && (
            <span className="h-4 w-4 border-2 border-stone border-t-transparent rounded-full animate-spin" aria-hidden />
          )}
          {isAdding ? 'Adding…' : isVariable && !selectedSize ? 'Select a Size' : canAddToCart ? 'Add to Cart' : 'Out of Stock'}
        </button>
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={isWishlisted}
          className="w-12 h-12 flex items-center justify-center rounded-input border border-hairline hover:border-wine hover:text-wine text-stone transition-colors"
        >
          <Heart className={clsx('h-5 w-5', isWishlisted && 'fill-wine text-wine')} aria-hidden />
        </button>
      </div>

      {/* WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 h-11 w-full rounded-input border border-hairline text-sm font-body text-stone hover:border-whatsapp hover:text-whatsapp transition-colors"
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
        Order via WhatsApp
      </a>
    </div>
  )
}
