import type { Metadata } from 'next'
import { ContentPageLayout } from '@/components/layout/ContentPageLayout'
import { FaqsClient } from '@/components/content/FaqsClient'
import { fetchFaqItems, DEFAULT_FAQS } from '@/lib/wp/home-content'
import { breadcrumbSchema, faqPageSchema } from '@/lib/seo/schema'
import { BASE_URL as SITE } from '@/lib/config/site'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Answers to common questions about MYGIFT orders, shipping, returns, payments, and gift customisation.',
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE}/faqs` },
}

export default async function FaqsPage() {
  const items = (await fetchFaqItems()) ?? DEFAULT_FAQS

  const breadcrumb = breadcrumbSchema([
    { name: 'Home', url: SITE },
    { name: 'FAQs', url: `${SITE}/faqs` },
  ])

  const faqSchema = faqPageSchema(items)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ContentPageLayout
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'FAQs' }]}
        heading="Frequently Asked Questions"
        intro="Everything you need to know about shopping with MYGIFT."
      >
        <FaqsClient items={items} />
      </ContentPageLayout>
    </>
  )
}
