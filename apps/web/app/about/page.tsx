import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { RibbonHeading } from '@/components/ui/RibbonHeading'
import { ProseContent } from '@/components/content/ProseContent'
import { Button } from '@/components/ui/Button'
import { fetchGraphQLSafe } from '@/lib/wp/client'
import { GET_WP_PAGE } from '@/lib/wp/queries/pages'
import type { WpPage } from '@/lib/wp/queries/pages'
import { breadcrumbSchema } from '@/lib/seo/schema'
import { Package, Gift, MapPin } from 'lucide-react'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mygift.pk'

export const metadata: Metadata = {
  title: 'About MYGIFT — Our Story',
  description: 'Learn about MYGIFT — crafted clothing and personalised gift boxes delivered across Pakistan.',
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE}/about` },
}

interface PageResponse {
  page: WpPage | null
}

const WHY_CARDS = [
  {
    icon: Package,
    title: 'Crafted Clothing',
    desc: 'Premium stitched and unstitched suits in lawn, chiffon, khaddar and more. Quality you can feel.',
  },
  {
    icon: Gift,
    title: 'Gifts Made Personal',
    desc: 'Our Gift Builder lets you create bespoke gift boxes with a message card — delivered beautifully wrapped.',
  },
  {
    icon: MapPin,
    title: 'Pakistan-wide Delivery',
    desc: 'From Karachi to Gilgit, we deliver to every corner of Pakistan. Free shipping on orders over Rs. 3,000.',
  },
]

export default async function AboutPage() {
  const data = await fetchGraphQLSafe<PageResponse>(
    GET_WP_PAGE,
    { slug: 'about' },
    { tags: ['page-about'], revalidate: 86400 }
  )

  const page = data?.page
  const breadcrumb = breadcrumbSchema([
    { name: 'Home', url: SITE },
    { name: 'About', url: `${SITE}/about` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <div className="bg-cream min-h-screen">
        {/* Intro band */}
        <div className="bg-gradient-to-b from-cream to-[var(--wine-tint)] py-12 sm:py-16">
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
            <Breadcrumbs
              items={[{ label: 'Home', href: '/' }, { label: 'About' }]}
              className="mb-8"
            />
            <div className="max-w-[700px]">
              <p className="font-display text-[clamp(48px,8vw,80px)] uppercase leading-none text-wine mb-4">
                MYGIFT
              </p>
              <p className="font-body text-lg sm:text-xl text-stone leading-relaxed">
                Clothing and custom gift boxes delivered across Pakistan — with love.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <RibbonHeading as="h1" className="sr-only">
            About MYGIFT
          </RibbonHeading>

          {/* WP content */}
          {page?.content && (
            <div className="max-w-[760px] mb-14">
              <ProseContent html={page.content} />
            </div>
          )}

          {/* Why MYGIFT cards */}
          <div className="mb-14">
            <RibbonHeading as="h2" className="text-[28px] sm:text-[32px] mb-8">
              Why MYGIFT
            </RibbonHeading>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-[900px]">
              {WHY_CARDS.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="rounded-card border border-hairline bg-ivory p-6 space-y-4"
                >
                  <div className="w-10 h-10 rounded-card bg-[var(--wine-tint)] flex items-center justify-center">
                    <Icon className="h-5 w-5 text-wine" aria-hidden />
                  </div>
                  <div>
                    <p className="font-body font-semibold text-ink mb-1">{title}</p>
                    <p className="font-body text-sm text-stone leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA pair */}
          <div className="flex flex-wrap gap-3">
            <Button as="link" href="/shop">
              Shop Now
            </Button>
            <Button as="link" href="/gift-builder" variant="secondary">
              Build a Gift
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
