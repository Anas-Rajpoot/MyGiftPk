import type { Metadata } from 'next'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { RibbonHeading } from '@/components/ui/RibbonHeading'
import { ProseContent } from '@/components/content/ProseContent'
import { InPageToc } from '@/components/content/InPageToc'
import { fetchGraphQLSafe } from '@/lib/wp/client'
import { GET_WP_PAGE } from '@/lib/wp/queries/pages'
import type { WpPage } from '@/lib/wp/queries/pages'
import { breadcrumbSchema } from '@/lib/seo/schema'
import { extractToc } from '@/lib/content/toc'
import { BASE_URL as SITE } from '@/lib/config/site'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Read MYGIFT\'s terms and conditions. Understand your rights and responsibilities when using our services.',
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE}/terms` },
}

interface PageResponse {
  page: WpPage | null
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function TermsPage() {
  const data = await fetchGraphQLSafe<PageResponse>(
    GET_WP_PAGE,
    { slug: 'terms' },
    { tags: ['page-terms'], revalidate: 86400 }
  )

  const page = data?.page
  const rawContent = page?.content ?? '<p>Terms and conditions will be published soon.</p>'
  const { html: content, toc } = extractToc(rawContent)

  const breadcrumb = breadcrumbSchema([
    { name: 'Home', url: SITE },
    { name: 'Terms & Conditions', url: `${SITE}/terms` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <div className="bg-cream min-h-screen">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <Breadcrumbs
            items={[{ label: 'Home', href: '/' }, { label: 'Terms & Conditions' }]}
            className="mb-6"
          />

          <div className="max-w-[760px]">
            <RibbonHeading as="h1" className="text-[clamp(28px,5vw,40px)] mb-2">
              Terms & Conditions
            </RibbonHeading>
            {page?.modified && (
              <p className="font-body text-sm text-stone mt-3">
                Last updated: {formatDate(page.modified)}
              </p>
            )}
          </div>

          <div className="mt-8 flex flex-col lg:flex-row gap-10 lg:gap-16">
            {/* Main content */}
            <div className="max-w-[620px] w-full">
              <ProseContent html={content} />
            </div>

            {/* Sticky TOC — desktop only */}
            {toc.length > 0 && (
              <aside className="hidden lg:block w-56 shrink-0">
                <div className="sticky top-8">
                  <InPageToc items={toc} />
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
