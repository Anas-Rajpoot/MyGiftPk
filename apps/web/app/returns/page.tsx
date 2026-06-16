import type { Metadata } from 'next'
import { ContentPageLayout } from '@/components/layout/ContentPageLayout'
import { ProseContent } from '@/components/content/ProseContent'
import { Callout } from '@/components/ui/Callout'
import { fetchGraphQLSafe } from '@/lib/wp/client'
import { GET_WP_PAGE } from '@/lib/wp/queries/pages'
import type { WpPage } from '@/lib/wp/queries/pages'
import { breadcrumbSchema } from '@/lib/seo/schema'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mygift.pk'

export const metadata: Metadata = {
  title: 'Returns & Exchanges',
  description: 'MYGIFT returns and exchange policy. Learn how to return an item and what qualifies for a refund.',
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE}/returns` },
}

interface PageResponse {
  page: WpPage | null
}

const RETURN_STEPS = [
  {
    num: '1',
    title: 'Contact Us Within 7 Days',
    desc: 'Reach out via WhatsApp or email with your order number and reason for return.',
  },
  {
    num: '2',
    title: 'Ship Back the Item',
    desc: 'Pack the item securely with original tags and packaging. Ship to our return address.',
  },
  {
    num: '3',
    title: 'Receive Refund or Exchange',
    desc: 'Once received and inspected, your refund or exchange will be processed within 5–7 business days.',
  },
]

export default async function ReturnsPage() {
  const data = await fetchGraphQLSafe<PageResponse>(
    GET_WP_PAGE,
    { slug: 'returns' },
    { tags: ['page-returns'], revalidate: 86400 }
  )

  const page = data?.page
  const breadcrumb = breadcrumbSchema([
    { name: 'Home', url: SITE },
    { name: 'Returns & Exchanges', url: `${SITE}/returns` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <ContentPageLayout
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Returns & Exchanges' }]}
        heading="Returns & Exchanges"
        intro="We want you to love what you order. If something is not right, we will make it right."
      >
        <div className="max-w-[760px] space-y-10">
          {/* 3 Steps strip */}
          <div className="relative">
            {/* Connecting line — visible on sm+ */}
            <div
              aria-hidden
              className="hidden sm:block absolute top-[28px] left-[56px] right-[56px] h-0.5 bg-wine"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {RETURN_STEPS.map((step) => (
                <div key={step.num} className="flex flex-col items-center text-center gap-3 relative z-10">
                  <div className="w-14 h-14 rounded-full bg-wine flex items-center justify-center shrink-0">
                    <span className="font-display text-3xl leading-none text-ivory">
                      {step.num}
                    </span>
                  </div>
                  <div>
                    <p className="font-body font-semibold text-sm text-ink">{step.title}</p>
                    <p className="font-body text-xs text-stone leading-relaxed mt-1 max-w-[200px] mx-auto">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WP content */}
          {page?.content && (
            <ProseContent html={page.content} />
          )}

          {/* Exclusions callout */}
          <Callout
            variant="warning"
            title="Items We Cannot Accept Back"
          >
            <ul className="space-y-1 list-none">
              <li>Customised or personalised gifts (printed cards, engraved items)</li>
              <li>Cut or unstitched fabric that has been altered</li>
              <li>Items without original tags or packaging</li>
              <li>Items returned after 7 days of delivery</li>
              <li>Washed, worn or damaged items</li>
            </ul>
          </Callout>
        </div>
      </ContentPageLayout>
    </>
  )
}
