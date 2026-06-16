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

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mygift.pk'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read MYGIFT\'s privacy policy. Learn how we collect, use and protect your personal data.',
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE}/privacy-policy` },
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

export default async function PrivacyPolicyPage() {
  const data = await fetchGraphQLSafe<PageResponse>(
    GET_WP_PAGE,
    { slug: 'privacy-policy' },
    { tags: ['page-privacy-policy'], revalidate: 86400 }
  )

  const page = data?.page
  const rawContent = page?.content ?? '<p>This privacy policy will be published soon.</p>'
  const { html: content, toc } = extractToc(rawContent)

  const breadcrumb = breadcrumbSchema([
    { name: 'Home', url: SITE },
    { name: 'Privacy Policy', url: `${SITE}/privacy-policy` },
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
            items={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]}
            className="mb-6"
          />

          <div className="max-w-[760px]">
            <RibbonHeading as="h1" className="text-[clamp(28px,5vw,40px)] mb-2">
              Privacy Policy
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
