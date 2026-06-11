import { Suspense } from 'react'
import type { Metadata } from 'next'
import { WishlistPageClient } from '@/components/wishlist/WishlistPageClient'

export const metadata: Metadata = {
  title: 'Wishlist',
  robots: { index: false },
}

export default function WishlistPage() {
  return (
    <Suspense>
      <WishlistPageClient />
    </Suspense>
  )
}
