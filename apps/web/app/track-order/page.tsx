import type { Metadata } from 'next'
import { ContentPageLayout } from '@/components/layout/ContentPageLayout'
import { breadcrumbSchema } from '@/lib/seo/schema'
import { TrackOrderClient } from '@/components/content/TrackOrderClient'
import { BASE_URL as SITE } from '@/lib/config/site'

export const metadata: Metadata = {
  title: 'Track Your Order',
  description: 'Enter your order number and billing phone to track your MYGIFT order.',
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE}/track-order` },
}

export default function TrackOrderPage() {
  const breadcrumb = breadcrumbSchema([
    { name: 'Home', url: SITE },
    { name: 'Track Order', url: `${SITE}/track-order` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <ContentPageLayout
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Track Your Order' }]}
        heading="Track Your Order"
        intro="Enter your order number and billing phone number to see your order status."
      >
        <TrackOrderClient />
      </ContentPageLayout>
    </>
  )
}
