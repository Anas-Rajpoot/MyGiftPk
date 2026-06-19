import type { FooterSocials } from '@/lib/wp/queries/global'
import type { ProductFull, CategoryData } from '@/lib/wp/queries/shop'
import { BASE_URL as BASE } from '@/lib/config/site'
import { stripHtml } from '@/lib/utils/html'

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
    description: stripHtml(product.shortDescription || product.description || product.name),
    sku: product.sku,
    url,
    image: product.image?.sourceUrl
      ? [product.image.sourceUrl, ...product.galleryImages.nodes.map((n) => n.sourceUrl)]
      : [],
    brand: { '@type': 'Brand', name: 'MYGIFT' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PKR',
      price: parseFloat((product.salePrice ?? product.price ?? '0').replace(/[^0-9]/g, '')) || undefined,
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url,
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'MYGIFT' },
    },
  }
}

export function itemListSchema(items: { name: string; url: string; image?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: item.url,
      image: item.image,
    })),
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

export function faqPageSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer.replace(/<[^>]*>/g, '') },
    })),
  }
}

export function localBusinessSchema(contact: { phone?: string; email?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'MYGIFT',
    url: BASE,
    telephone: contact.phone,
    email: contact.email,
  }
}

export function articleSchema(post: {
  title: string
  url: string
  date: string
  modified: string
  image?: string
  authorName?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    url: post.url,
    datePublished: post.date,
    dateModified: post.modified,
    author: { '@type': 'Person', name: post.authorName ?? 'MYGIFT' },
    image: post.image ? [post.image] : [],
    publisher: { '@type': 'Organization', name: 'MYGIFT', url: BASE },
  }
}
