import { notFound } from 'next/navigation'
import { fetchGraphQL } from '@/lib/wp/client'
import { GET_PRODUCT } from '@/lib/wp/queries/shop'
import type { ProductPageData } from '@/lib/wp/queries/shop'
import { fetchWooProduct, WOO_REST_ENABLED } from '@/lib/woo/rest-client'
import { QuickViewModal } from '@/components/product/QuickViewModal'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function QuickViewPage({ params }: Props) {
  const { slug } = await params

  let product = null

  if (WOO_REST_ENABLED) {
    product = await fetchWooProduct(slug)
  } else {
    const data = await fetchGraphQL<ProductPageData>(
      GET_PRODUCT,
      { slug },
      { tags: [`product-${slug}`], revalidate: 3600 }
    )
    product = data.product
  }

  if (!product) notFound()

  return <QuickViewModal product={product} />
}
