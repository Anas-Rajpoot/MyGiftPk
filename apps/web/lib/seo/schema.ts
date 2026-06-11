import type { FooterSocials } from '@/lib/wp/queries/global'
import type { ProductFull, CategoryData } from '@/lib/wp/queries/shop'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mygift.pk'

export function organizationSchema(socials?: FooterSocials) {
  const sameAs = [
    socials?.instagram,
    socials?.facebook,
  ].filter((s): s is string => typeof s === 'string' && s.startsWith('http'))

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MYGIFT',
    url: BASE,
    logo: `${BASE}/logo.png`,
    sameAs,
  }
}

export function webSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MYGIFT',
    url: BASE,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE}/shop?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function productSchema(product: ProductFull) {
  const url = `${BASE}/product/${product.slug}`
  const inStock = product.stockStatus === 'IN_STOCK'
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.description,
    sku: product.sku,
    url,
    image: product.image?.sourceUrl
      ? [product.image.sourceUrl, ...product.galleryImages.nodes.map((n) => n.sourceUrl)]
      : [],
    brand: { '@type': 'Brand', name: 'MYGIFT' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PKR',
      price: product.salePrice ?? product.price,
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url,
      seller: { '@type': 'Organization', name: 'MYGIFT' },
    },
  }
}

export function collectionPageSchema(category: CategoryData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.seo.title || category.name,
    description: category.seo.metaDesc || category.description,
    url: `${BASE}/category/${category.slug}`,
    numberOfItems: category.count,
  }
}
