import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Gift, Heart, Star, Sparkles, Coffee, ShoppingBag, Cake, Moon, Flower2, GraduationCap, PartyPopper } from 'lucide-react'
import { RibbonHeading } from '@/components/ui/RibbonHeading'
import {
  fetchWooAllCategories,
  WOO_REST_ENABLED,
  type WooCategoryCard,
} from '@/lib/woo/rest-client'
import type { LucideIcon } from 'lucide-react'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mygift.pk'

export const metadata: Metadata = {
  title: 'Gifts — MYGIFT',
  description:
    'Explore our gift collections — birthday, anniversary, chocolates, custom hampers and more. Delivered anywhere in Pakistan.',
  alternates: { canonical: `${BASE_URL}/gifts` },
  openGraph: {
    title: 'Shop Gifts — MYGIFT',
    description: 'Beautifully curated gifts for every occasion — delivered anywhere in Pakistan.',
    url: `${BASE_URL}/gifts`,
    images: [`${BASE_URL}/api/og?title=Shop+Gifts&sub=Curated+gifts+for+every+occasion`],
  },
}

const MOCK_GIFT_CATEGORIES: WooCategoryCard[] = [
  { id: '35', slug: 'combos-gift', name: 'Combos Gift', count: 18, image: null },
  { id: '36', slug: 'custom', name: 'Custom Gift', count: 21, image: null },
  { id: '33', slug: 'birthday', name: 'Birthday', count: 15, image: null },
  { id: '40', slug: 'anniversary', name: 'Anniversary', count: 11, image: null },
  { id: '34', slug: 'chocolates', name: 'Chocolates', count: 9, image: null },
  { id: '16', slug: 'accessories', name: 'Accessories', count: 4, image: null },
]

// SVG icon map keyed by slug fragment
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  birthday: Cake,
  anniversary: Heart,
  chocolates: Coffee,
  'combos-gift': Gift,
  combo: Gift,
  custom: Sparkles,
  eid: Moon,
  wedding: Flower2,
  mothers: Flower2,
  graduation: GraduationCap,
  party: PartyPopper,
  accessories: ShoppingBag,
  women: ShoppingBag,
  men: ShoppingBag,
  kids: Star,
}

function getCategoryIcon(slug: string): LucideIcon {
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (slug.includes(key)) return icon
  }
  return Gift
}

interface CategoryCardProps {
  cat: WooCategoryCard
}

function CategoryCard({ cat }: CategoryCardProps) {
  const hasRealImage = cat.image?.sourceUrl && !cat.image.sourceUrl.startsWith('/placeholder')

  return (
    <Link
      href={`/category/${cat.slug}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2 rounded-card"
    >
      <div className="relative aspect-[3/4] rounded-card overflow-hidden bg-gold-tint">
        {hasRealImage && cat.image ? (
          <Image
            src={cat.image.sourceUrl}
            alt={cat.image.altText}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {React.createElement(getCategoryIcon(cat.slug), {
              className: 'h-14 w-14 text-gold/40 transition-colors group-hover:text-gold/60',
              'aria-hidden': true,
            })}
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-gold/10 to-transparent" />
          </div>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" aria-hidden />
        {/* Label */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="font-display text-xl sm:text-2xl uppercase text-ivory leading-none group-hover:text-gold transition-colors duration-150">
            {cat.name}
          </p>
          <p className="font-body text-xs text-ivory/70 mt-1 group-hover:text-ivory transition-colors">
            {cat.count} product{cat.count !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </Link>
  )
}

export default async function GiftsPage() {
  let categories: WooCategoryCard[] = MOCK_GIFT_CATEGORIES

  if (WOO_REST_ENABLED) {
    try {
      categories = await fetchWooAllCategories(true)
    } catch {
      categories = MOCK_GIFT_CATEGORIES
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <div className="bg-ivory border-b border-hairline py-12 sm:py-16 px-6 text-center">
        <div className="max-w-[640px] mx-auto">
          <RibbonHeading as="h1" align="center" gold className="text-4xl sm:text-5xl mb-4">
            SHOP GIFTS
          </RibbonHeading>
          <p className="font-body text-base text-stone mt-6">
            Beautifully curated gifts for every occasion — delivered anywhere in Pakistan.
          </p>
        </div>
      </div>

      <div className="max-w-[1320px] mx-auto px-6 py-12 sm:py-16 space-y-12">
        {/* Categories grid */}
        {categories.length > 0 ? (
          <section>
            <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-wide text-ink mb-6">
              Shop by Occasion
            </h2>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 list-none p-0 m-0">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <CategoryCard cat={cat} />
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <div className="py-20 text-center">
            <p className="font-body text-stone">No categories found.</p>
          </div>
        )}

        {/* Gift Builder banner */}
        <section className="rounded-card bg-ink text-ivory overflow-hidden">
          <div className="px-6 py-10 sm:px-12 sm:py-12 flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
            <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
              <Gift className="h-8 w-8 text-gold" aria-hidden />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-wide mb-2">
                Can&apos;t find the perfect gift?
              </h2>
              <p className="font-body text-sm text-ivory/70">
                Build your own custom gift box — choose treats, add a message, pick a ribbon.
              </p>
            </div>
            <Link
              href="/gift-builder"
              className="shrink-0 h-12 px-7 rounded-input bg-gold hover:bg-amber-500 text-ink font-body font-semibold text-sm flex items-center transition-colors"
            >
              Build a Gift
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
