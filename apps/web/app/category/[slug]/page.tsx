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
  WOO_REST_ENABLED,
} from '@/lib/woo/rest-client'
import { parseFilters } from '@/lib/utils/filters'
import type { RawSearchParams } from '@/lib/utils/filters'
import { breadcrumbSchema, collectionPageSchema } from '@/lib/seo/schema'
import { FilterSidebar } from '@/components/shop/FilterSidebar'
import { FilterBottomSheet } from '@/components/shop/FilterBottomSheet'
import { ActiveFilters } from '@/components/shop/ActiveFilters'
import { CategoryIntro } from '@/components/shop/CategoryIntro'
import { ProductCardGrid } from '@/components/product/ProductCardGrid'
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

  return {
    title: cat.seo?.title ?? cat.name,
    description: cat.seo?.metaDesc ?? cat.description,
    alternates: { canonical: cat.seo?.canonical },
    openGraph: {
      title: cat.seo?.opengraphTitle ?? cat.name,
      description: cat.seo?.opengraphDescription ?? cat.description,
      images: cat.seo?.opengraphImage?.sourceUrl ? [cat.seo.opengraphImage.sourceUrl] : [],
    },
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, raw] = await Promise.all([params, searchParams])
  const filters = parseFilters(raw)
  const basePath = `/category/${slug}`

  let cat: CategoryData | null = null
  let nodes: ProductNode[] = []
  let found = 0

  if (WOO_REST_ENABLED) {
    [cat] = await Promise.all([fetchWooCategory(slug)])
    if (!cat) notFound()

    const result = await fetchWooProducts({
      first: 16,
      category: slug,
      onSale: filters.on_sale === '1' ? true : undefined,
      type: filters.type,
      size: filters.size,
      sort: filters.sort,
    })
    nodes = result.nodes
    found = result.found
  } else {
    const data = await fetchGraphQL<CategoryPageData>(
      GET_CATEGORY_WITH_PRODUCTS,
      {
        slug,
        first: 16,
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

  const breadcrumb = breadcrumbSchema([
    { name: 'Home', url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mygift.pk' },
    { name: cat.name, url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mygift.pk'}${basePath}` },
  ])
  const collectionSchema = collectionPageSchema(cat)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {cat.acfCategoryIntro?.intro ? (
          <div className="mb-6">
            <CategoryIntro name={cat.name} intro={cat.acfCategoryIntro.intro} count={found} />
          </div>
        ) : (
          <h1 className="font-display text-2xl sm:text-3xl uppercase tracking-wide text-ink mb-6">
            {cat.name}
            <span className="ml-3 font-body text-base font-normal text-stone normal-case tracking-normal">
              {found} products
            </span>
          </h1>
        )}

        <div className="flex gap-8">
          <FilterSidebar basePath={basePath} filters={filters} />

          <div className="flex-1 min-w-0 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <FilterBottomSheet basePath={basePath} filters={filters} />
              <ActiveFilters basePath={basePath} filters={filters} />
            </div>

            {nodes.length === 0 ? (
              <div className="py-20 text-center">
                <p className="font-body text-stone text-base">No products found for these filters.</p>
              </div>
            ) : (
              <ProductCardGrid products={nodes} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
