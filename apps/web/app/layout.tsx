import type { Metadata } from 'next'
import { Bebas_Neue, Poppins } from 'next/font/google'
import './globals.css'
import { fetchGraphQL } from '@/lib/wp/client'
import { GET_GLOBAL_OPTIONS } from '@/lib/wp/queries/global'
import type { GlobalOptionsResponse } from '@/lib/wp/queries/global'
import { organizationSchema, webSiteSchema } from '@/lib/seo/schema'
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
}: Readonly<{
  children: React.ReactNode
}>) {
  const globalData = await fetchGraphQL<GlobalOptionsResponse>(
    GET_GLOBAL_OPTIONS,
    {},
    { tags: ['global'], revalidate: 3600 }
  )
  const opts = globalData.globalOptions

  const orgSchema = organizationSchema(opts?.footer?.socials)
  const siteSchema = webSiteSchema()

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
      </head>
      <body className="min-h-screen flex flex-col bg-cream text-ink antialiased">
        {opts?.announcementBar?.enabled && (
          <AnnouncementBar data={opts.announcementBar} />
        )}
        <Header navItems={opts?.headerMenu ?? []} />
        <CartDrawer />
        <main className="flex-1">
          {children}
        </main>
        <Footer data={opts?.footer ?? { columns: [], socials: {}, contact: {}, bottomText: '© 2025 MYGIFT' }} />
        <ToastContainer />
      </body>
    </html>
  )
}
