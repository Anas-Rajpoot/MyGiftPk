import type { Metadata } from 'next'
import { Bebas_Neue, Poppins } from 'next/font/google'
import './globals.css'
import { fetchGraphQL } from '@/lib/wp/client'
import { GET_GLOBAL_OPTIONS } from '@/lib/wp/queries/global'
import type { GlobalOptionsResponse, NavItem } from '@/lib/wp/queries/global'
import { WOO_REST_ENABLED, fetchWooNavCategories } from '@/lib/woo/rest-client'
import { NAV_ITEMS, FIXED_NAV_BEFORE, FIXED_NAV_AFTER } from '@/lib/config/nav'
import { organizationSchema, webSiteSchema, localBusinessSchema } from '@/lib/seo/schema'
import { fetchHomeContent } from '@/lib/wp/home-content'
import { AnnouncementBar } from '@/components/layout/AnnouncementBar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/layout/CartDrawer'
import { ToastContainer } from '@/components/ui/Toast'

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
})

const bebasNeue = Bebas_Neue({
  variable: '--font-bebas',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'MYGIFT — Gifts & Clothing Delivered Across Pakistan',
    template: '%s | MYGIFT',
  },
  description:
    'Shop clothing and build custom gift boxes delivered across Pakistan. Free shipping on orders over Rs. 3,000.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mygift.pk'),
}

export default async function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode
  modal?: React.ReactNode
}>) {
  const [globalData, wooNav, homeContent] = await Promise.all([
    fetchGraphQL<GlobalOptionsResponse>(GET_GLOBAL_OPTIONS, {}, { tags: ['global'], revalidate: 3600 }),
    WOO_REST_ENABLED ? fetchWooNavCategories() : Promise.resolve(null),
    fetchHomeContent(),
  ])
  const opts = globalData.globalOptions
  // Live WP REST data takes priority over GraphQL fixture for announcement bar
  const announcementBar = homeContent?.announcementBar ?? opts?.announcementBar

  // Build nav: live WC categories when REST is enabled, otherwise lib/config/nav.ts
  const navItems: NavItem[] = wooNav
    ? [...FIXED_NAV_BEFORE, ...wooNav, ...FIXED_NAV_AFTER]
    : NAV_ITEMS

  const orgSchema = organizationSchema(opts?.footer?.socials)
  const siteSchema = webSiteSchema()
  const bizSchema = localBusinessSchema(opts?.footer?.contact ?? {})

  return (
    <html lang="en" className={`${poppins.variable} ${bebasNeue.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(bizSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-cream text-ink antialiased" suppressHydrationWarning>
        {announcementBar?.enabled && (
          <AnnouncementBar data={announcementBar} />
        )}
        <Header navItems={navItems} />
        <CartDrawer />
        <main className="flex-1">
          {children}
        </main>
        {modal}
        <Footer data={opts?.footer ?? { columns: [], socials: {}, contact: {}, bottomText: '© 2025 MYGIFT' }} />
        <ToastContainer />
      </body>
    </html>
  )
}
