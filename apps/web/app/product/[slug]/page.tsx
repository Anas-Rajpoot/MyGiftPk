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
import Link from 'next/link'
import { ShieldCheck, RefreshCw, Truck, BadgeCheck } from 'lucide-react'
import { ProductGallery } from '@/components/product/ProductGallery'
import { ProductActionsWrapper } from '@/components/product/ProductActionsWrapper'
import { ProductAccordions } from '@/components/product/ProductAccordions'
import { ProductCardGrid } from '@/components/product/ProductCardGrid'
import { RibbonHeading } from '@/components/ui/RibbonHeading'
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
    alternates: { canonical: `${base}/product/${slug}` },
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

      {/* ── Breadcrumb ─────────────────────────────────────────────── */}
      <div className="border-b border-hairline">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-body text-[11px] uppercase tracking-[0.14em] text-stone">
            <Link href="/" className="hover:text-wine transition-colors">Home</Link>
            <span className="text-hairline">·</span>
            {firstCat && (
              <>
                <Link href={`/category/${firstCat.slug}`} className="hover:text-wine transition-colors capitalize">
                  {firstCat.name}
                </Link>
                <span className="text-hairline">·</span>
              </>
            )}
            <span className="text-ink truncate max-w-[220px]">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* ── Hero: Gallery + Info ────────────────────────────────────── */}
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 sm:py-14">
        <div className="lg:grid lg:grid-cols-[1fr_460px] lg:gap-16 xl:gap-20">

          {/* Gallery — sticky on desktop */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductGallery
              mainImage={product.image}
              gallery={product.galleryImages?.nodes ?? []}
              productName={product.name}
            />
          </div>

          {/* Info panel */}
          <div className="mt-10 lg:mt-0 flex flex-col gap-7">

            {/* Category label */}
            {firstCat && (
              <Link href={`/category/${firstCat.slug}`} className="inline-flex items-center gap-2.5 w-fit group">
                <div className="h-px w-6 bg-wine transition-all group-hover:w-10" />
                <span className="font-body text-[11px] uppercase tracking-[0.24em] text-stone group-hover:text-wine transition-colors">
                  {firstCat.name}
                </span>
              </Link>
            )}

            {/* Product name */}
            <div>
              <h1 className="font-display text-[38px] sm:text-[50px] uppercase tracking-wide text-ink leading-none">
                {product.name}
              </h1>
              <div className="flex items-center gap-1.5 mt-4">
                <div className="h-[2px] w-14 bg-wine rounded-full" />
                <div className="w-2 h-2 bg-wine rounded-full" />
                <div className="h-[2px] w-5 bg-wine/25 rounded-full" />
              </div>
            </div>

            {/* Price + attributes + ATC */}
            <ProductActionsWrapper product={product} />

            {/* Trust badges */}
            <div className="border-t border-hairline pt-5 grid grid-cols-2 gap-2.5">
              {[
                { icon: Truck,       label: 'Free Shipping',   sub: 'Orders over Rs. 3,000' },
                { icon: RefreshCw,   label: 'Easy Returns',    sub: '7-day return policy' },
                { icon: BadgeCheck,  label: '100% Authentic',  sub: 'Verified originals' },
                { icon: ShieldCheck, label: 'Secure Payment',  sub: 'SSL encrypted' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-start gap-2.5 p-3 rounded-card border border-hairline bg-cream/60">
                  <Icon className="h-3.5 w-3.5 text-wine mt-[1px] shrink-0" aria-hidden />
                  <div>
                    <p className="font-body text-[11px] font-semibold text-ink leading-tight">{label}</p>
                    <p className="font-body text-[10px] text-stone mt-0.5 leading-tight">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* ── Accordion sections ─────────────────────────────────────── */}
      {product.description && (
        <section className="border-t border-hairline bg-ivory">
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
            <ProductAccordions
              description={product.description}
              firstCat={firstCat}
            />
          </div>
        </section>
      )}

      {/* ── Related products ────────────────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-hairline">
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <RibbonHeading as="h2" className="text-2xl sm:text-3xl mb-10">
              YOU MAY ALSO LIKE
            </RibbonHeading>
            <ProductCardGrid products={relatedProducts} />
          </div>
        </section>
      )}
    </>
  )
}
