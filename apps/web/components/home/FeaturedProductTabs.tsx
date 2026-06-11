import Link from 'next/link'
import { Tabs } from '@/components/ui/Tabs'
import { RibbonHeading } from '@/components/ui/RibbonHeading'
import { ProductCardGrid } from '@/components/product/ProductCardGrid'
import { fetchGraphQL } from '@/lib/wp/client'
import { GET_FEATURED_PRODUCTS } from '@/lib/wp/queries/products'
import type { ProductsResponse } from '@/lib/wp/queries/products'
import type { ProductNode } from '@/lib/wp/queries/products'
import { fetchWooProducts, WOO_REST_ENABLED } from '@/lib/woo/rest-client'
import type { FeaturedTab } from '@/lib/wp/queries/home'

interface FeaturedProductTabsProps {
  tabs: FeaturedTab[]
}

async function getTabProducts(categorySlug: string): Promise<ProductNode[]> {
  if (WOO_REST_ENABLED) {
    const result = await fetchWooProducts({ category: categorySlug, first: 8 })
    return result.nodes
  }
  const data = await fetchGraphQL<ProductsResponse>(
    GET_FEATURED_PRODUCTS,
    { categorySlug, first: 8 },
    { tags: [`category:${categorySlug}`, 'home'], revalidate: 3600 }
  )
  return data.products?.nodes ?? []
}

export async function FeaturedProductTabs({ tabs }: FeaturedProductTabsProps) {
  const tabsWithContent = await Promise.all(
    tabs.map(async (tab) => {
      const products = await getTabProducts(tab.categorySlug)

      return {
        id: tab.id,
        label: tab.title,
        content: (
          <div>
            {products.length === 0 ? (
              <p className="font-body text-stone text-sm py-8 text-center">No products found.</p>
            ) : (
              <ProductCardGrid products={products} />
            )}
            <div className="mt-8 text-center">
              <Link
                href={`/category/${tab.categorySlug}`}
                className="inline-flex items-center font-body text-sm font-semibold text-wine hover:text-wine-deep underline underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine"
              >
                View all {tab.title} →
              </Link>
            </div>
          </div>
        ),
      }
    })
  )

  return (
    <section aria-labelledby="featured-heading" className="py-14 sm:py-24 bg-ivory">
      <div className="max-w-[1320px] mx-auto px-6">
        <RibbonHeading as="h2" id="featured-heading" align="center" className="text-4xl sm:text-5xl mb-8 sm:mb-10">
          FEATURED COLLECTIONS
        </RibbonHeading>
        <Tabs tabs={tabsWithContent} />
      </div>
    </section>
  )
}
