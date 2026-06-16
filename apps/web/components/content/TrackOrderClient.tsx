'use client'

import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { OrderTimeline } from '@/components/content/OrderTimeline'
import { trackOrder } from '@/app/track-order/actions'
import type { TrackOrderResult } from '@/lib/woo/order-status'

export function TrackOrderClient() {
  const [orderNumber, setOrderNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<TrackOrderResult | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setOrder(null)

    startTransition(async () => {
      const result = await trackOrder(orderNumber.trim(), phone.trim())
      if (result.success) {
        setOrder(result.order)
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <div className="max-w-[540px] space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Order Number"
          type="text"
          placeholder="e.g. 1001"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          required
          disabled={isPending}
        />
        <Input
          label="Billing Phone Number"
          type="tel"
          autoComplete="tel"
          placeholder="e.g. 03001234567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          disabled={isPending}
          hint="The phone number used when placing the order"
        />

        {error && (
          <p role="alert" className="font-body text-sm text-wine">
            {error}
          </p>
        )}

        <Button type="submit" loading={isPending} className="w-full sm:w-auto">
          Track Order
        </Button>
      </form>

      {order && (
        <div className="rounded-card border border-hairline bg-ivory p-5 space-y-6">
          {/* Header */}
          <div>
            <p className="font-body font-semibold text-ink">
              Order #{order.orderNumber}
            </p>
            <p className="font-body text-sm text-stone mt-0.5">
              {new Date(order.date).toLocaleDateString('en-PK', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              {order.city && <> · {order.city}</>}
            </p>
          </div>

          {/* Timeline */}
          <OrderTimeline order={order} />

          {/* Items */}
          <div className="border-t border-hairline pt-4 space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between gap-2">
                <p className="font-body text-sm text-ink">
                  {item.name}
                  {item.qty > 1 && (
                    <span className="ml-1 text-stone">×{item.qty}</span>
                  )}
                </p>
                {!item.hidePrice && item.total && (
                  <p className="font-body text-sm text-stone shrink-0">{item.total}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
