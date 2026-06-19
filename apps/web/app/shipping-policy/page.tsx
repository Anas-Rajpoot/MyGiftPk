import type { Metadata } from 'next'
import { ContentPageLayout } from '@/components/layout/ContentPageLayout'
import { ProseContent } from '@/components/content/ProseContent'
import { fetchGraphQLSafe } from '@/lib/wp/client'
import { GET_WP_PAGE } from '@/lib/wp/queries/pages'
import type { WpPage } from '@/lib/wp/queries/pages'
import { breadcrumbSchema } from '@/lib/seo/schema'
import { BASE_URL as SITE } from '@/lib/config/site'

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy',
  description: 'MYGIFT shipping zones, delivery times and costs across Pakistan. Free shipping on orders over Rs. 3,000.',
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE}/shipping-policy` },
}

interface PageResponse {
  page: WpPage | null
}

const ZONES = [
  {
    zone: 'Karachi, Lahore & Islamabad',
    days: '1–2 days',
    cost: 'Rs. 150',
    free: 'Over Rs. 3,000',
  },
  {
    zone: 'Other major cities',
    days: '2–4 days',
    cost: 'Rs. 200',
    free: 'Over Rs. 3,000',
  },
  {
    zone: 'Remote areas',
    days: '4–7 days',
    cost: 'Rs. 250',
    free: 'Not available',
  },
]

export default async function ShippingPolicyPage() {
  const data = await fetchGraphQLSafe<PageResponse>(
    GET_WP_PAGE,
    { slug: 'shipping-policy' },
    { tags: ['page-shipping-policy'], revalidate: 86400 }
  )

  const page = data?.page
  const breadcrumb = breadcrumbSchema([
    { name: 'Home', url: SITE },
    { name: 'Shipping Policy', url: `${SITE}/shipping-policy` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <ContentPageLayout
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Shipping Policy' }]}
        heading="Shipping & Delivery"
        intro="We deliver across Pakistan. Here is what to expect."
      >
        <div className="max-w-[760px] space-y-10">
          {/* Shipping zones summary table */}
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="min-w-[480px] px-4 sm:px-0">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    {['Zone', 'Est. Days', 'Cost', 'Free Shipping'].map((h) => (
                      <th
                        key={h}
                        className="bg-wine text-ivory font-body font-semibold px-3 py-2.5 text-left"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ZONES.map((row, i) => (
                    <tr key={row.zone}>
                      <td className={`border border-hairline px-3 py-2.5 font-body text-ink ${i % 2 === 0 ? 'bg-ivory' : 'bg-cream'}`}>
                        {row.zone}
                      </td>
                      <td className={`border border-hairline px-3 py-2.5 font-body text-stone ${i % 2 === 0 ? 'bg-ivory' : 'bg-cream'}`}>
                        {row.days}
                      </td>
                      <td className={`border border-hairline px-3 py-2.5 font-body text-stone ${i % 2 === 0 ? 'bg-ivory' : 'bg-cream'}`}>
                        {row.cost}
                      </td>
                      <td className={`border border-hairline px-3 py-2.5 font-body text-stone ${i % 2 === 0 ? 'bg-ivory' : 'bg-cream'}`}>
                        {row.free}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* WP content */}
          {page?.content && (
            <ProseContent html={page.content} />
          )}

          {/* International note */}
          <div className="rounded-card border border-hairline bg-ivory p-5">
            <p className="font-body font-semibold text-sm text-ink mb-1">
              Sending from Abroad?
            </p>
            <p className="font-body text-sm text-stone leading-relaxed">
              Overseas Pakistanis can order on behalf of family in Pakistan. Simply enter a Pakistani delivery address at checkout. Cash on Delivery is available for the recipient.
            </p>
          </div>
        </div>
      </ContentPageLayout>
    </>
  )
}
