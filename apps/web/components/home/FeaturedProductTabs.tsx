import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Tabs } from '@/components/ui/Tabs'
import { RibbonHeading } from '@/components/ui/RibbonHeading'
import { ProductCardGrid } from '@/components/product/ProductCardGrid'
import { fetchGraphQL } from '@/lib/wp/client'
import { GET_FEATURED_PRODUCTS } from '@/lib/wp/queries/products'
import type { ProductsResponse, ProductNode } from '@/lib/wp/queries/products'
import { fetchWooProducts, WOO_REST_ENABLED } from '@/lib/woo/rest-client'
import type { FeaturedTab } from '@/lib/wp/queries/home'

// 6 products = exactly 2 rows × 3 columns
const PER_TAB = 6

interface FeaturedProductTabsProps {
  tabs: FeaturedTab[]
}

async function getTabProducts(categorySlug: string): Promise<ProductNode[]> {
  if (WOO_REST_ENABLED) {
    const result = await fetchWooProducts({
      category: categorySlug || undefined,
      first: PER_TAB,
    })
    return result.nodes
  }
  const data = await fetchGraphQL<ProductsResponse>(
    GET_FEATURED_PRODUCTS,
    { categorySlug: categorySlug || null, first: PER_TAB },
    { tags: categorySlug ? [`category:${categorySlug}`, 'home'] : ['products', 'home'], revalidate: 3600 }
  )
  return data.products?.nodes ?? []
}

export async function FeaturedProductTabs({ tabs }: FeaturedProductTabsProps) {
  // "All" tab + category tabs
  const allTabs: FeaturedTab[] = [
    { id: '__all__', title: 'All', categorySlug: '' },
    ...tabs,
  ]

  const tabsWithContent = await Promise.all(
    allTabs.map(async (tab) => {
      const products = await getTabProducts(tab.categorySlug)
      const href = tab.id === '__all__' ? '/shop' : `/category/${tab.categorySlug}`
      const viewMoreLabel = tab.id === '__all__' ? 'View All Products' : `View All ${tab.title}`

      return {
        id: tab.id,
        label: tab.title,
        content: (
          <div>
            {products.length === 0 ? (
              <p className="font-body text-stone text-sm py-12 text-center">No products found.</p>
            ) : (
              <ProductCardGrid products={products} columns={3} />
            )}

            {/* View More CTA */}
            <div className="mt-10 flex justify-center">
              <Link
                href={href}
                className="group inline-flex items-center gap-2.5 h-12 px-10 rounded-input border-2 border-wine text-wine font-body font-semibold text-[15px] tracking-wide hover:bg-wine hover:text-ivory transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2"
              >
                {viewMoreLabel}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
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
