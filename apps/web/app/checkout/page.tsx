import type { Metadata } from 'next'
import { CheckoutClient } from '@/components/checkout/CheckoutClient'

export const metadata: Metadata = {
  title: 'Checkout — MYGIFT',
  robots: { index: false, follow: false },
}

// Dynamic: needs live cart data
export const dynamic = 'force-dynamic'

export default function CheckoutPage() {
  return <CheckoutClient />
}
