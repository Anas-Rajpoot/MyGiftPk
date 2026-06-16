import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchGraphQL } from '@/lib/wp/client'
import { GET_CATEGORY_WITH_PRODUCTS, GET_CATEGORY_SLUGS } from '@/lib/wp/queries/shop'
import type { CategoryPageData } from '@/lib/wp/queries/shop'
import type { ProductNode } from '@/lib/wp/queries/products'
import {
  fetchWooCategory,
  fetchWooCategorySlugs,
  fetchWooProducts,
  fetchWooAllCategories,
  WOO_REST_ENABLED,
} from '@/lib/woo/rest-client'
import { fetchCategoryIntro } from '@/lib/wp/home-content'
import { parseFilters } from '@/lib/utils/filters'
import type { RawSearchParams } from '@/lib/utils/filters'
import { breadcrumbSchema, collectionPageSchema } from '@/lib/seo/schema'
import { FilterSidebar } from '@/components/shop/FilterSidebar'
import { FilterBottomSheet } from '@/components/shop/FilterBottomSheet'
import { ActiveFilters } from '@/components/shop/ActiveFilters'
import { CategoryIntro } from '@/components/shop/CategoryIntro'
import { ShopControls } from '@/components/shop/ShopControls'
import { Pagination } from '@/components/shop/Pagination'
import { RibbonHeading } from '@/components/ui/RibbonHeading'
import type { CategoryData } from '@/lib/wp/queries/shop'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<RawSearchParams>
}

export async function generateStaticParams() {
  if (WOO_REST_ENABLED) {
    const slugs = await fetchWooCategorySlugs()
    return slugs.map((slug) => ({ slug }))
  }
  const data = await fetchGraphQL<{ productCategories: { nodes: { slug: string }[] } }>(
    GET_CATEGORY_SLUGS,
    {},
    { revalidate: 86400 }
  )
  return (data.productCategories?.nodes ?? []).map((n) => ({ slug: n.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  let cat: CategoryData | null = null

  if (WOO_REST_ENABLED) {
    cat = await fetchWooCategory(slug)
  } else {
    const data = await fetchGraphQL<CategoryPageData>(
      GET_CATEGORY_WITH_PRODUCTS,
      { slug, first: 16 },
      { tags: [`category-${slug}`], revalidate: 3600 }
    )
    cat = data?.productCategory ?? null
  }

  if (!cat) return { title: 'Category' }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mygift.pk'
  const ogImage =
    cat.seo?.opengraphImage?.sourceUrl ??
    cat.image?.sourceUrl ??
    `${base}/api/og?title=${encodeURIComponent(cat.name)}&sub=${encodeURIComponent('mygift.pk')}`

  return {
    title: cat.seo?.title ?? cat.name,
    description: cat.seo?.metaDesc ?? cat.description,
    alternates: { canonical: `${base}/category/${slug}` },
    openGraph: {
      title: cat.seo?.opengraphTitle ?? cat.name,
      description: cat.seo?.opengraphDescription ?? cat.description ?? '',
      url: `${base}/category/${slug}`,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: cat.seo?.opengraphTitle ?? cat.name,
      description: cat.seo?.opengraphDescription ?? cat.description ?? '',
      images: [ogImage],
    },
  }
}

const PER_PAGE = 12

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, raw] = await Promise.all([params, searchParams])
  const filters = parseFilters(raw)
  const basePath = `/category/${slug}`
  const currentPage = Math.max(1, parseInt(filters.page ?? '1', 10))

  let cat: CategoryData | null = null
  let nodes: ProductNode[] = []
  let found = 0
  let allCategories: Array<{ slug: string; name: string; count: number }> = []

  if (WOO_REST_ENABLED) {
    const [fetchedCat, result, categories] = await Promise.all([
      fetchWooCategory(slug),
      fetchWooProducts({
        first: PER_PAGE,
        page: currentPage,
        category: slug,
        onSale: filters.on_sale === '1' ? true : undefined,
        type: filters.type,
        size: filters.size,
        sort: filters.sort,
        minPrice: filters.min_price ? parseFloat(filters.min_price) : undefined,
        maxPrice: filters.max_price ? parseFloat(filters.max_price) : undefined,
      }),
      fetchWooAllCategories(true),
    ])
    if (!fetchedCat) notFound()
    cat = fetchedCat
    nodes = result.nodes
    found = result.found
    allCategories = categories
  } else {
    const data = await fetchGraphQL<CategoryPageData>(
      GET_CATEGORY_WITH_PRODUCTS,
      {
        slug,
        first: PER_PAGE,
        type: filters.type,
        onSale: filters.on_sale === '1' ? true : undefined,
      },
      { tags: [`category-${slug}`, 'products'], revalidate: 3600 }
    )
    if (!data?.productCategory) notFound()
    cat = data.productCategory
    nodes = data.products?.nodes ?? []
    found = data.products?.found ?? 0
  }

  if (!cat) notFound()

  const intro = await fetchCategoryIntro(slug)
  const totalPages = Math.ceil(found / PER_PAGE)

  const breadcrumb = breadcrumbSchema([
    { name: 'Home', url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mygift.pk' },
    { name: cat.name, url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mygift.pk'}${basePath}` },
  ])
  const collectionSchema = collectionPageSchema(cat)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Heading */}
        <div className="mb-8">
          {intro ? (
            <CategoryIntro name={cat.name} intro={intro} count={found} />
          ) : (
            <RibbonHeading as="h1" className="text-2xl sm:text-3xl">
              {cat.name.toUpperCase()}
            </RibbonHeading>
          )}
        </div>

        <div className="flex gap-8 lg:gap-10">
          <FilterSidebar basePath={basePath} filters={filters} categories={allCategories} />

          <div className="flex-1 min-w-0 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <FilterBottomSheet basePath={basePath} filters={filters} categories={allCategories} />
              <ActiveFilters basePath={basePath} filters={filters} />
            </div>

            <ShopControls products={nodes} found={found} />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={basePath}
              filters={filters}
            />
          </div>
        </div>
      </div>
    </>
  )
}
