'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'
import { clsx } from 'clsx'
import type { OrderSummary } from '@/app/api/account/orders/route'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  'on-hold': 'On Hold',
  completed: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  failed: 'Failed',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-stone bg-cream',
  processing: 'text-ink bg-cream border-ink/20',
  'on-hold': 'text-stone bg-cream',
  completed: 'text-green-700 bg-green-50',
  cancelled: 'text-wine bg-wine-tint',
  refunded: 'text-stone bg-cream',
  failed: 'text-wine bg-wine-tint',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Orders still in progress vs. closed/archived
const CLOSED_STATUSES = new Set(['completed', 'cancelled', 'refunded', 'failed'])
const isActive = (status: string) => !CLOSED_STATUSES.has(status)

function OrderCard({ order }: { order: OrderSummary }) {
  const [expanded, setExpanded] = useState(false)
  const status = STATUS_LABELS[order.status] ?? order.status
  const color = STATUS_COLORS[order.status] ?? 'text-stone bg-cream'

  const active = isActive(order.status)

  return (
    <div className={clsx(
      'rounded-card border bg-ivory overflow-hidden',
      active ? 'border-wine/30 ring-1 ring-wine/10' : 'border-hairline'
    )}>
      <button
        className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left hover:bg-cream transition-colors"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Package className="h-5 w-5 text-stone flex-shrink-0" aria-hidden />
          <div className="min-w-0">
            <p className="font-body font-semibold text-sm text-ink">Order #{order.number}</p>
            <p className="font-body text-xs text-stone mt-0.5">{formatDate(order.dateCreated)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={clsx('font-body text-xs font-medium px-2 py-0.5 rounded-full border border-transparent', color)}>
            {status}
          </span>
          <span className="font-body text-sm font-semibold text-ink">
            PKR {Number(order.total).toLocaleString()}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-stone" aria-hidden />
          ) : (
            <ChevronDown className="h-4 w-4 text-stone" aria-hidden />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-hairline px-4 py-3 space-y-2">
          {order.lineItems.map((li, i) => (
            <div key={i} className="flex justify-between items-start gap-2">
              <p className="font-body text-sm text-ink">
                {li.name}
                {li.quantity > 1 && (
                  <span className="ml-1 text-stone">x{li.quantity}</span>
                )}
              </p>
              <p className="font-body text-sm text-stone flex-shrink-0">
                PKR {Number(li.total).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function OrderList() {
  const [orders, setOrders] = useState<OrderSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/account/orders')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error)
        else setOrders(d.orders ?? [])
      })
      .catch(() => setError('Could not load orders'))
  }, [])

  if (error) {
    return <p className="font-body text-sm text-wine">{error}</p>
  }

  if (orders === null) {
    return (
      <div className="space-y-3">
        {[1, 2].map((n) => (
          <div key={n} className="h-16 rounded-card bg-cream animate-pulse" />
        ))}
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="py-12 text-center">
        <Package className="mx-auto h-10 w-10 text-stone mb-3" aria-hidden />
        <p className="font-body text-sm text-stone mb-4">No orders yet.</p>
        <Link href="/shop" className="font-body text-sm text-wine hover:text-wine-deep underline underline-offset-2">
          Start shopping
        </Link>
      </div>
    )
  }

  const active = orders.filter((o) => isActive(o.status))
  const past = orders.filter((o) => !isActive(o.status))

  return (
    <div className="space-y-8">
      {active.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-2 w-2 relative" aria-hidden>
              <span className="absolute inline-flex h-full w-full rounded-full bg-wine opacity-60 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-wine" />
            </span>
            <h3 className="font-body text-sm font-semibold text-ink uppercase tracking-wide">
              Active orders
            </h3>
            <span className="font-body text-xs text-stone">({active.length})</span>
          </div>
          <div className="space-y-3">
            {active.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h3 className="font-body text-sm font-semibold text-stone uppercase tracking-wide mb-3">
            {active.length > 0 ? 'Past orders' : 'Order history'}
            <span className="ml-1.5 font-normal text-stone">({past.length})</span>
          </h3>
          <div className="space-y-3">
            {past.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
