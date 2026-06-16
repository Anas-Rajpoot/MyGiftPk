import type { Metadata } from 'next'
import { OrderList } from '@/components/account/OrderList'

export const metadata: Metadata = {
  title: 'My Orders',
  robots: { index: false },
}

export default function OrdersPage() {
  return (
    <div>
      <h2 className="font-display text-xl uppercase tracking-wide text-ink mb-5">
        My Orders
      </h2>
      <OrderList />
    </div>
  )
}
