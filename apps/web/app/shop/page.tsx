import type { Metadata } from 'next'
import { fetchGraphQL } from '@/lib/wp/client'
import { GET_SHOP_PRODUCTS } from '@/lib/wp/queries/shop'
import type { ShopProductsData } from '@/lib/wp/queries/shop'
import { fetchWooProducts, WOO_REST_ENABLED } from '@/lib/woo/rest-client'
import { parseFilters } from '@/lib/utils/filters'
import type { RawSearchParams } from '@/lib/utils/filters'
import type { ProductNode } from '@/lib/wp/queries/products'
import { breadcrumbSchema } from '@/lib/seo/schema'
import { FilterSidebar } from '@/components/shop/FilterSidebar'
import { FilterBottomSheet } from '@/components/shop/FilterBottomSheet'
import { ActiveFilters } from '@/components/shop/ActiveFilters'
import { ProductCardGrid } from '@/components/product/ProductCardGrid'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mygift.pk'
const BASE_PATH = '/shop'

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

  let products: ProductNode[] = []
  let found = 0

  if (WOO_REST_ENABLED) {
    const result = await fetchWooProducts({
      first: 16,
      category: filters.category,
      onSale: filters.on_sale === '1' ? true : undefined,
      type: filters.type,
      size: filters.size,
      sort: filters.sort,
    })
    products = result.nodes
    found = result.found
  } else {
    const data = await fetchGraphQL<ShopProductsData>(
      GET_SHOP_PRODUCTS,
      {
        first: 16,
        categorySlug: filters.category,
        type: filters.type,
        onSale: filters.on_sale === '1' ? true : undefined,
      },
      { tags: ['products'], revalidate: 3600 }
    )
    products = data.products?.nodes ?? []
    found = data.products?.found ?? 0
  }

  const breadcrumb = breadcrumbSchema([
    { name: 'Home', url: SITE },
    { name: 'Shop', url: `${SITE}/shop` },
  ])

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <h1 className="font-display text-2xl sm:text-3xl uppercase tracking-wide text-ink mb-6">
          Shop All
          <span className="ml-3 font-body text-base font-normal text-stone normal-case tracking-normal">
            {found} products
          </span>
        </h1>

        <div className="flex gap-8">
          <FilterSidebar basePath={BASE_PATH} filters={filters} />

          <div className="flex-1 min-w-0 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <FilterBottomSheet basePath={BASE_PATH} filters={filters} />
              <ActiveFilters basePath={BASE_PATH} filters={filters} />
            </div>

            {products.length === 0 ? (
              <div className="py-20 text-center">
                <p className="font-body text-stone text-base">No products found for these filters.</p>
              </div>
            ) : (
              <ProductCardGrid products={products} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
