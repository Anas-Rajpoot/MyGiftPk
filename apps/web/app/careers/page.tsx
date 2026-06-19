import type { Metadata } from 'next'
import { ContentPageLayout } from '@/components/layout/ContentPageLayout'
import { ProseContent } from '@/components/content/ProseContent'
import { EmptyState } from '@/components/ui/EmptyState'
import { fetchGraphQLSafe } from '@/lib/wp/client'
import { GET_WP_PAGE } from '@/lib/wp/queries/pages'
import type { JobListing, WpPage } from '@/lib/wp/queries/pages'
import { fetchJobListings } from '@/lib/wp/home-content'
import { breadcrumbSchema } from '@/lib/seo/schema'
import { MapPin, Briefcase } from 'lucide-react'
import { BASE_URL as SITE } from '@/lib/config/site'

export const metadata: Metadata = {
  title: 'Careers at MYGIFT',
  description: 'Join the MYGIFT team. See open positions in our clothing and gifts business based in Pakistan.',
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE}/careers` },
}

interface CareersPageResponse {
  page: WpPage | null
}

function JobCard({ job }: { job: JobListing }) {
  return (
    <article className="rounded-card border border-hairline bg-ivory p-6 space-y-4">
      <div>
        <h3 className="font-body font-semibold text-lg text-ink">{job.jobTitle}</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {job.location && (
            <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-chip bg-cream border border-hairline font-body text-xs text-stone">
              <MapPin className="h-3 w-3" aria-hidden />
              {job.location}
            </span>
          )}
          {job.jobType && (
            <span className="inline-flex items-center gap-1.5 h-7 px-3 rounded-chip bg-[var(--wine-tint)] font-body text-xs text-wine">
              <Briefcase className="h-3 w-3" aria-hidden />
              {job.jobType}
            </span>
          )}
        </div>
      </div>

      {job.description && (
        <p className="font-body text-sm text-stone leading-relaxed">{job.description}</p>
      )}

      {job.applyEmail && (
        <a
          href={`mailto:${job.applyEmail}?subject=Application: ${encodeURIComponent(job.jobTitle)}`}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-input bg-wine text-ivory font-body font-semibold text-sm hover:bg-wine-deep transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2"
        >
          Apply via Email
        </a>
      )}
    </article>
  )
}

export default async function CareersPage() {
  const [data, jobListings] = await Promise.all([
    fetchGraphQLSafe<CareersPageResponse>(
      GET_WP_PAGE,
      { slug: 'careers' },
      { tags: ['page:careers'], revalidate: 3600 }
    ),
    fetchJobListings(),
  ])

  const page = data?.page
  const jobs = jobListings ?? []
  const breadcrumb = breadcrumbSchema([
    { name: 'Home', url: SITE },
    { name: 'Careers', url: `${SITE}/careers` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <ContentPageLayout
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Careers' }]}
        heading="Careers"
        intro="Join the MYGIFT team. We are always looking for passionate people."
      >
        <div className="max-w-[760px] space-y-10">
          {/* WP intro content */}
          {page?.content && (
            <ProseContent html={page.content} />
          )}

          {/* Job listings */}
          <div>
            <h2 className="font-display text-2xl uppercase text-ink mb-6">Open Positions</h2>

            {jobs.length > 0 ? (
              <div className="space-y-4">
                {jobs.map((job, i) => (
                  <JobCard key={i} job={job} />
                ))}
              </div>
            ) : (
              <EmptyState
                heading="No openings right now"
                description="But we would love to hear from you. Send us your CV and we will keep you in mind."
                cta={{
                  label: 'Send Your CV',
                  href: 'mailto:careers@mygift.pk?subject=Speculative Application',
                }}
              />
            )}
          </div>
        </div>
      </ContentPageLayout>
    </>
  )
}
