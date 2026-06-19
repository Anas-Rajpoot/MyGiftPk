import type { Metadata } from 'next'
import { fetchGraphQLSafe } from '@/lib/wp/client'
import { GET_HOME_SEO } from '@/lib/wp/queries/home'
import type { HomePageData } from '@/lib/wp/queries/home'
import { fetchHomeContent, DEFAULT_HOME_CONTENT } from '@/lib/wp/home-content'
import { HomeBlockRenderer } from '@/components/home/HomeBlockRenderer'
import { BASE_URL as SITE_URL } from '@/lib/config/site'
import { itemListSchema } from '@/lib/seo/schema'
import { fetchWooProducts, WOO_REST_ENABLED } from '@/lib/woo/rest-client'

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchGraphQLSafe<HomePageData>(
    GET_HOME_SEO,
    {},
    { tags: ['home', 'global'], revalidate: 3600 }
  )
  const seo = data?.page?.seo

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
  const [homeContent, featured] = await Promise.all([
    fetchHomeContent(),
    WOO_REST_ENABLED
      ? fetchWooProducts({ first: 8 }).catch(() => null)
      : Promise.resolve(null),
  ])

  const listSchema = itemListSchema(
    (featured?.nodes ?? []).map((p) => ({
      name: p.name,
      url: `${SITE_URL}/product/${p.slug}`,
      image: p.image?.sourceUrl,
    }))
  )

  return (
    <>
      {featured && featured.nodes.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(listSchema) }}
        />
      )}
      <HomeBlockRenderer blocks={(homeContent ?? DEFAULT_HOME_CONTENT).blocks} />
    </>
  )
}
