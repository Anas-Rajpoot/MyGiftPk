import type { Metadata } from 'next'
import { fetchGiftBuilderOptions, DEFAULT_GIFT_BUILDER } from '@/lib/wp/home-content'
import { GiftBuilderLoader } from '@/components/gift/GiftBuilderLoader'

export const dynamic = 'force-dynamic'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mygift.pk'

export const metadata: Metadata = {
  title: 'Build a Gift — MYGIFT',
  description:
    'Create a personalised gift box — choose a box, fill it with treats, add a heartfelt message, and send it anywhere in Pakistan.',
  alternates: { canonical: `${BASE}/gift-builder` },
  openGraph: {
    title: 'Build a Custom Gift Box — MYGIFT',
    description: 'Pick a box, fill it with treats, add a message. Delivered anywhere in Pakistan.',
    url: `${BASE}/gift-builder`,
    images: [`${BASE}/api/og?title=Build+a+Gift&sub=Custom+gift+boxes+delivered+across+Pakistan`],
  },
}

export default async function GiftBuilderPage() {
  const options = (await fetchGiftBuilderOptions()) ?? DEFAULT_GIFT_BUILDER

  return <GiftBuilderLoader options={options} />
}
