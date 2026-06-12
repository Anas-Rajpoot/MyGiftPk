import type { Metadata } from 'next'
import { fetchGraphQL } from '@/lib/wp/client'
import { GET_GIFT_BUILDER_OPTIONS } from '@/lib/wp/queries/gift'
import type { GiftBuilderOptionsResponse } from '@/lib/wp/queries/gift'
import { GiftBuilderLoader } from '@/components/gift/GiftBuilderLoader'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Build a Gift — MYGIFT',
  description:
    'Create a personalised gift box — choose a box, fill it with treats, add a heartfelt message, and send it anywhere in Pakistan.',
}

export default async function GiftBuilderPage() {
  const data = await fetchGraphQL<GiftBuilderOptionsResponse>(
    GET_GIFT_BUILDER_OPTIONS,
    {},
    { tags: ['gift-builder'], revalidate: 3600 }
  )

  const options = data.giftBuilderOptions

  if (!options) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="text-center">
          <p className="font-display text-2xl uppercase text-ink mb-2">Coming Soon</p>
          <p className="font-body text-sm text-stone">
            The Gift Builder is being set up. Check back soon!
          </p>
        </div>
      </div>
    )
  }

  return <GiftBuilderLoader options={options} />
}
