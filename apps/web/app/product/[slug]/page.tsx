import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchGraphQL } from '@/lib/wp/client'
import { GET_PRODUCT, GET_PRODUCT_SLUGS } from '@/lib/wp/queries/shop'
import type { ProductPageData } from '@/lib/wp/queries/shop'
import {
  fetchWooProduct,
  fetchWooProductSlugs,
  fetchWooRelatedProducts,
  WOO_REST_ENABLED,
} from '@/lib/woo/rest-client'
import { breadcrumbSchema, productSchema } from '@/lib/seo/schema'
import { ProductGallery } from '@/components/product/ProductGallery'
import { ProductActionsWrapper } from '@/components/product/ProductActionsWrapper'
import { ProductCardGrid } from '@/components/product/ProductCardGrid'
import type { ProductFull } from '@/lib/wp/queries/shop'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    if (WOO_REST_ENABLED) {
      const slugs = await fetchWooProductSlugs()
      return slugs.map((slug) => ({ slug }))
    }
    const data = await fetchGraphQL<{ products: { nodes: { slug: string }[] } }>(
      GET_PRODUCT_SLUGS,
      { first: 100 },
      { revalidate: 86400 }
    )
    return (data.products?.nodes ?? []).map((n) => ({ slug: n.slug }))
  } catch {
    // If the WooCommerce server is unreachable at build time, skip pre-rendering.
    // Pages will be rendered on first request (dynamic fallback).
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  let product: ProductFull | null = null

  if (WOO_REST_ENABLED) {
    product = await fetchWooProduct(slug)
  } else {
    const data = await fetchGraphQL<ProductPageData>(
      GET_PRODUCT,
      { slug },
      { tags: [`product-${slug}`], revalidate: 3600 }
    )
    product = data?.product ?? null
  }

  if (!product) return { title: 'Product' }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mygift.pk'
  const ogImage =
    product.seo?.opengraphImage?.sourceUrl ??
    product.image?.sourceUrl ??
    `${base}/api/og?title=${encodeURIComponent(product.name)}&sub=${encodeURIComponent('mygift.pk')}`

  return {
    title: product.seo?.title ?? product.name,
    description: product.seo?.metaDesc ?? product.shortDescription,
    alternates: { canonical: product.seo?.canonical ?? `${base}/product/${slug}` },
    openGraph: {
      title: product.seo?.opengraphTitle ?? product.name,
      description: product.seo?.opengraphDescription ?? product.shortDescription ?? '',
      url: `${base}/product/${slug}`,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.seo?.opengraphTitle ?? product.name,
      description: product.seo?.opengraphDescription ?? product.shortDescription ?? '',
      images: [ogImage],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params

  let product: ProductFull | null = null

  if (WOO_REST_ENABLED) {
    product = await fetchWooProduct(slug)
  } else {
    const data = await fetchGraphQL<ProductPageData>(
      GET_PRODUCT,
      { slug },
      { tags: [`product-${slug}`], revalidate: 3600 }
    )
    product = data?.product ?? null
  }

  if (!product) notFound()

  const firstCat = product.productCategories?.nodes[0]

  // Fetch related products from same category
  let relatedProducts = product.related?.nodes ?? []
  if (WOO_REST_ENABLED && firstCat?.slug) {
    relatedProducts = await fetchWooRelatedProducts(firstCat.slug, product.databaseId, 4)
  }

  const breadcrumb = breadcrumbSchema([
    { name: 'Home', url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mygift.pk' },
    {
      name: firstCat?.name ?? 'Shop',
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mygift.pk'}/category/${firstCat?.slug ?? 'shop'}`,
    },
    {
      name: product.name,
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mygift.pk'}/product/${product.slug}`,
    },
  ])
  const pSchema = productSchema(product)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pSchema) }} />

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          <ProductGallery
            mainImage={product.image}
            gallery={product.galleryImages?.nodes ?? []}
            productName={product.name}
          />
          <div className="mt-6 lg:mt-0">
            <ProductActionsWrapper product={product} />
          </div>
        </div>

        {product.description && (
          <div className="mt-12 max-w-2xl">
            <h2 className="font-display text-xl uppercase tracking-wide text-ink mb-4">
              Product Details
            </h2>
            <div
              className="font-body text-sm text-stone leading-relaxed prose-sm prose-li:marker:text-wine"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}

        {relatedProducts.length > 0 && (
          <div className="mt-14">
            <h2 className="font-display text-xl uppercase tracking-wide text-ink mb-6">
              You May Also Like
            </h2>
            <ProductCardGrid products={relatedProducts} />
          </div>
        )}
      </div>
    </>
  )
}
