import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { RibbonHeading } from '@/components/ui/RibbonHeading'
import { ProseContent } from '@/components/content/ProseContent'
import { fetchGraphQL, fetchGraphQLSafe } from '@/lib/wp/client'
import { GET_BLOG_POST, GET_BLOG_SLUGS } from '@/lib/wp/queries/pages'
import type { BlogPostFull } from '@/lib/wp/queries/pages'
import { breadcrumbSchema, articleSchema } from '@/lib/seo/schema'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mygift.pk'

interface BlogPostResponse {
  post: BlogPostFull | null
}

interface BlogSlugsResponse {
  posts: { nodes: { slug: string }[] }
}

export async function generateStaticParams() {
  const data = await fetchGraphQL<BlogSlugsResponse>(
    GET_BLOG_SLUGS,
    {},
    { revalidate: 3600 }
  )
  return (data.posts?.nodes ?? []).map((n) => ({ slug: n.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await fetchGraphQLSafe<BlogPostResponse>(
    GET_BLOG_POST,
    { slug },
    { tags: [`blog-post-${slug}`], revalidate: 3600 }
  )
  const post = data?.post
  if (!post) return { title: 'Post Not Found' }

  const seoTitle = post.seo?.title || post.title
  const seoDesc = post.seo?.metaDesc || post.excerpt?.replace(/<[^>]*>/g, '').slice(0, 160)
  const ogImage = post.seo?.opengraphImage?.sourceUrl || post.featuredImage?.node.sourceUrl

  return {
    title: seoTitle,
    description: seoDesc,
    openGraph: {
      title: post.seo?.opengraphTitle || seoTitle,
      description: post.seo?.opengraphDescription || seoDesc,
      images: ogImage ? [{ url: ogImage }] : [],
    },
    alternates: { canonical: `${SITE}/blog/${slug}` },
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await fetchGraphQLSafe<BlogPostResponse>(
    GET_BLOG_POST,
    { slug },
    { tags: [`blog-post-${slug}`], revalidate: 3600 }
  )

  const post = data?.post
  if (!post) notFound()

  const breadcrumb = breadcrumbSchema([
    { name: 'Home', url: SITE },
    { name: 'Blog', url: `${SITE}/blog` },
    { name: post.title, url: `${SITE}/blog/${slug}` },
  ])

  const article = articleSchema({
    title: post.title,
    url: `${SITE}/blog/${slug}`,
    date: post.date,
    modified: post.modified,
    image: post.featuredImage?.node.sourceUrl,
    authorName: post.author?.node.name,
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
      />

      <div className="bg-cream min-h-screen">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Blog', href: '/blog' },
              { label: post.title },
            ]}
            className="mb-6"
          />

          <div className="max-w-[760px]">
            {/* Category */}
            {post.categories.nodes[0] && (
              <span className="inline-flex items-center h-6 px-3 rounded-chip bg-[var(--wine-tint)] text-wine font-body text-xs font-medium mb-4">
                {post.categories.nodes[0].name}
              </span>
            )}

            <RibbonHeading as="h1" className="text-[clamp(24px,4vw,36px)] mb-2">
              {post.title}
            </RibbonHeading>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mt-4 mb-8 font-body text-sm text-stone">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              {post.author?.node.name && (
                <>
                  <span aria-hidden>·</span>
                  <span>By {post.author.node.name}</span>
                </>
              )}
            </div>

            {/* Featured image */}
            {post.featuredImage?.node.sourceUrl && (
              <div className="aspect-video overflow-hidden rounded-card mb-8">
                <Image
                  src={post.featuredImage.node.sourceUrl}
                  alt={post.featuredImage.node.altText || post.title}
                  width={760}
                  height={427}
                  priority
                  className="object-cover w-full h-full"
                />
              </div>
            )}

            {/* Content */}
            <ProseContent html={post.content} />

            {/* Back to blog */}
            <div className="mt-12 pt-8 border-t border-hairline">
              <Link
                href="/blog"
                className="font-body text-sm text-wine hover:text-wine-deep underline underline-offset-2 transition-colors"
              >
                ← Back to Blog
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
