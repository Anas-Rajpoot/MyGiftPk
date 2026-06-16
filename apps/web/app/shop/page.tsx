import type { Metadata } from 'next'
import { fetchGraphQL } from '@/lib/wp/client'
import { GET_SHOP_PRODUCTS } from '@/lib/wp/queries/shop'
import type { ShopProductsData } from '@/lib/wp/queries/shop'
import { fetchWooProducts, fetchWooAllCategories, WOO_REST_ENABLED } from '@/lib/woo/rest-client'
import { parseFilters } from '@/lib/utils/filters'
import type { RawSearchParams } from '@/lib/utils/filters'
import type { ProductNode } from '@/lib/wp/queries/products'
import { breadcrumbSchema } from '@/lib/seo/schema'
import { FilterSidebar } from '@/components/shop/FilterSidebar'
import { FilterBottomSheet } from '@/components/shop/FilterBottomSheet'
import { ActiveFilters } from '@/components/shop/ActiveFilters'
import { ShopControls } from '@/components/shop/ShopControls'
import { Pagination } from '@/components/shop/Pagination'
import { RibbonHeading } from '@/components/ui/RibbonHeading'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mygift.pk'
const BASE_PATH = '/shop'
const PER_PAGE = 12

export const metadata: Metadata = {
  title: 'Shop All',
  description: 'Browse all clothing — stitched, unstitched, women, men, and kids. Nationwide delivery across Pakistan.',
  alternates: { canonical: `${SITE}/shop` },
  openGraph: {
    title: 'Shop All — MYGIFT',
    description: 'Browse all clothing — stitched, unstitched, women, men, and kids. Nationwide delivery across Pakistan.',
    url: `${SITE}/shop`,
    images: [`${SITE}/api/og?title=Shop+All&sub=Clothing+for+Women%2C+Men+%26+Kids`],
  },
}

interface Props {
  searchParams: Promise<RawSearchParams>
}

export default async function ShopPage({ searchParams }: Props) {
  const raw = await searchParams
  const filters = parseFilters(raw)
  const currentPage = Math.max(1, parseInt(filters.page ?? '1', 10))

  let products: ProductNode[] = []
  let found = 0
  let totalPages = 1

  if (WOO_REST_ENABLED) {
    const [result, categories] = await Promise.all([
      fetchWooProducts({
        first: PER_PAGE,
        page: currentPage,
        category: filters.category,
        onSale: filters.on_sale === '1' ? true : undefined,
        type: filters.type,
        size: filters.size,
        sort: filters.sort,
        minPrice: filters.min_price ? parseFloat(filters.min_price) : undefined,
        maxPrice: filters.max_price ? parseFloat(filters.max_price) : undefined,
      }),
      fetchWooAllCategories(true),
    ])
    products = result.nodes
    found = result.found
    totalPages = Math.ceil(found / PER_PAGE)

    const breadcrumb = breadcrumbSchema([
      { name: 'Home', url: SITE },
      { name: 'Shop', url: `${SITE}/shop` },
    ])

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
        <ShopLayout
          basePath={BASE_PATH}
          filters={filters}
          products={products}
          found={found}
          currentPage={currentPage}
          totalPages={totalPages}
          categories={categories}
          title="Shop All"
        />
      </>
    )
  }

  // GraphQL fallback
  const data = await fetchGraphQL<ShopProductsData>(
    GET_SHOP_PRODUCTS,
    {
      first: PER_PAGE,
      categorySlug: filters.category,
      type: filters.type,
      onSale: filters.on_sale === '1' ? true : undefined,
    },
    { tags: ['products'], revalidate: 3600 }
  )
  products = data.products?.nodes ?? []
  found = data.products?.found ?? 0
  totalPages = Math.ceil(found / PER_PAGE)

  const breadcrumb = breadcrumbSchema([
    { name: 'Home', url: SITE },
    { name: 'Shop', url: `${SITE}/shop` },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <ShopLayout
        basePath={BASE_PATH}
        filters={filters}
        products={products}
        found={found}
        currentPage={currentPage}
        totalPages={totalPages}
        categories={[]}
        title="Shop All"
      />
    </>
  )
}

/* ── Shared layout ─────────────────────────────────── */
interface ShopLayoutProps {
  basePath: string
  filters: ReturnType<typeof parseFilters>
  products: ProductNode[]
  found: number
  currentPage: number
  totalPages: number
  categories: Array<{ slug: string; name: string; count: number }>
  title: string
}

function ShopLayout({
  basePath,
  filters,
  products,
  found,
  currentPage,
  totalPages,
  categories,
  title,
}: ShopLayoutProps) {
  return (
    <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Heading */}
      <div className="mb-8">
        <RibbonHeading as="h1" className="text-2xl sm:text-3xl">
          {title.toUpperCase()}
        </RibbonHeading>
      </div>

      <div className="flex gap-8 lg:gap-10">
        {/* Sidebar */}
        <FilterSidebar basePath={basePath} filters={filters} categories={categories} />

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Mobile filter + active chips */}
          <div className="flex flex-wrap items-center gap-3">
            <FilterBottomSheet basePath={basePath} filters={filters} categories={categories} />
            <ActiveFilters basePath={basePath} filters={filters} />
          </div>

          {/* Products + column toggle */}
          <ShopControls products={products} found={found} />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={basePath}
            filters={filters}
          />
        </div>
      </div>
    </div>
  )
}
