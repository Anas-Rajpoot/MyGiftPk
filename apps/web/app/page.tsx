import type { Metadata } from 'next'
import { fetchGraphQL } from '@/lib/wp/client'
import { GET_HOME_PAGE } from '@/lib/wp/queries/home'
import type { HomePageData } from '@/lib/wp/queries/home'
import { HomeBlockRenderer } from '@/components/home/HomeBlockRenderer'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mygift.pk'

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchGraphQL<HomePageData>(
    GET_HOME_PAGE,
    {},
    { tags: ['home', 'global'], revalidate: 3600 }
  )
  const seo = data.page?.seo

  const title = seo?.title || 'MYGIFT — Gifts & Clothing Delivered Across Pakistan'
  const description =
    seo?.metaDesc ||
    'Shop stitched & unstitched clothing for Women, Men and Kids. Build custom gift boxes delivered nationwide. Free shipping on orders over Rs. 3,000.'
  const ogImage = seo?.opengraphImage?.sourceUrl ?? `${SITE_URL}/api/og?title=MYGIFT`

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `${SITE_URL}/` },
    openGraph: {
      title: seo?.opengraphTitle || title,
      description: seo?.opengraphDescription || description,
      url: `${SITE_URL}/`,
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo?.opengraphTitle || title,
      description: seo?.opengraphDescription || description,
      images: [ogImage],
    },
  }
}

export default async function HomePage() {
  const data = await fetchGraphQL<HomePageData>(
    GET_HOME_PAGE,
    {},
    { tags: ['home', 'global'], revalidate: 3600 }
  )

  const blocks = data.page?.homepageBuilder?.blocks ?? []

  return <HomeBlockRenderer blocks={blocks} />
}
