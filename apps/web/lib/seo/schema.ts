import type { FooterSocials } from '@/lib/wp/queries/global'

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
