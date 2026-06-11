import type { Metadata } from 'next'
import { Bebas_Neue, Poppins } from 'next/font/google'
import './globals.css'

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
  description: 'Shop clothing and build custom gift boxes delivered across Pakistan. Free shipping on orders over Rs. 3,000.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mygift.pk'),
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${bebasNeue.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-cream text-ink antialiased">
        {children}
      </body>
    </html>
  )
}
