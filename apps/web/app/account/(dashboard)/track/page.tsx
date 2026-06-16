import type { Metadata } from 'next'
import { TrackOrderForm } from '@/components/account/TrackOrderForm'

export const metadata: Metadata = {
  title: 'Track Order',
  robots: { index: false, follow: false },
}

export default function TrackOrderPage() {
  return (
    <div>
      <h2 className="font-display text-xl uppercase tracking-wide text-ink mb-2">
        Track an Order
      </h2>
      <p className="font-body text-sm text-stone mb-6">
        Enter your order number and the phone number used at checkout.
      </p>
      <TrackOrderForm />
    </div>
  )
}
