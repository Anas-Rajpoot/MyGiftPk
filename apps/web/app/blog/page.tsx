import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ContentPageLayout } from '@/components/layout/ContentPageLayout'
import { fetchGraphQL } from '@/lib/wp/client'
import { GET_BLOG_POSTS } from '@/lib/wp/queries/pages'
import type { BlogPost } from '@/lib/wp/queries/pages'
import { breadcrumbSchema } from '@/lib/seo/schema'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mygift.pk'

export const metadata: Metadata = {
  title: 'Blog — Gift Ideas & Style Tips',
  description: 'Discover gift ideas, style tips, and stories from the MYGIFT team.',
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE}/blog` },
}

interface BlogPostsResponse {
  posts: {
    nodes: BlogPost[]
    pageInfo: { hasNextPage: boolean; endCursor: string | null }
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <article className="rounded-card border border-hairline bg-ivory overflow-hidden flex flex-col">
      {/* Image */}
      <Link href={`/blog/${post.slug}`} className="block aspect-video overflow-hidden bg-cream">
        {post.featuredImage?.node.sourceUrl ? (
          <Image
            src={post.featuredImage.node.sourceUrl}
            alt={post.featuredImage.node.altText || post.title}
            width={640}
            height={360}
            className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-[var(--wine-tint)] flex items-center justify-center">
            <span className="font-display text-4xl uppercase text-wine/30">MYGIFT</span>
          </div>
        )}
      </Link>

      <div className="flex flex-col flex-1 p-5 space-y-3">
        {/* Category chip */}
        {post.categories.nodes[0] && (
          <span className="inline-flex self-start items-center h-6 px-3 rounded-chip bg-[var(--wine-tint)] text-wine font-body text-xs font-medium">
            {post.categories.nodes[0].name}
          </span>
        )}

        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h2 className="font-body font-semibold text-[17px] text-ink hover:text-wine transition-colors leading-snug">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        {post.excerpt && (
          <div
            className="font-body text-sm text-stone leading-relaxed line-clamp-3 flex-1"
            dangerouslySetInnerHTML={{ __html: post.excerpt }}
          />
        )}

        {/* Date */}
        <p className="font-body text-xs text-stone pt-1">{formatDate(post.date)}</p>
      </div>
    </article>
  )
}

export default async function BlogPage() {
  const data = await fetchGraphQL<BlogPostsResponse>(
    GET_BLOG_POSTS,
    { first: 12 },
    { tags: ['blog-posts'], revalidate: 3600 }
  )

  const posts = data.posts?.nodes ?? []
  const hasNextPage = data.posts?.pageInfo?.hasNextPage ?? false

  const breadcrumb = breadcrumbSchema([
    { name: 'Home', url: SITE },
    { name: 'Blog', url: `${SITE}/blog` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <ContentPageLayout
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Blog' }]}
        heading="Blog"
        intro="Gift ideas, style tips and stories from the MYGIFT team."
      >
        {posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {hasNextPage && (
              <div className="mt-10 text-center">
                <p className="font-body text-sm text-stone">
                  More posts coming soon.
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="font-body text-stone text-sm">No blog posts yet. Check back soon.</p>
        )}
      </ContentPageLayout>
    </>
  )
}
