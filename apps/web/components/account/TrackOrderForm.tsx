'use client'

import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Package, MapPin } from 'lucide-react'
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

const STATUS_STEPS = ['pending', 'processing', 'completed']

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function TrackOrderForm() {
  const [orderNumber, setOrderNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<OrderSummary | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)

    startTransition(async () => {
      try {
        const res = await fetch('/api/account/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderNumber: orderNumber.trim(), billingPhone: phone.trim() }),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error ?? 'Order not found')
          return
        }

        setResult(data.order)
      } catch {
        setError('Something went wrong. Please try again.')
      }
    })
  }

  const currentStep = result ? STATUS_STEPS.indexOf(result.status) : -1

  return (
    <div className="space-y-6 max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Order number"
          type="text"
          placeholder="e.g. 1001"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          required
          disabled={isPending}
        />
        <Input
          label="Billing phone number"
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
          <p role="alert" className="font-body text-sm text-wine">{error}</p>
        )}

        <Button type="submit" loading={isPending} className="w-full">
          Track order
        </Button>
      </form>

      {result && (
        <div className="rounded-card border border-hairline bg-ivory p-5 space-y-5">
          <div className="flex items-start gap-3">
            <Package className="h-5 w-5 text-wine mt-0.5 flex-shrink-0" aria-hidden />
            <div>
              <p className="font-body font-semibold text-sm text-ink">Order #{result.number}</p>
              <p className="font-body text-xs text-stone">{formatDate(result.dateCreated)}</p>
            </div>
          </div>

          {/* Progress steps */}
          <div className="flex items-center gap-1">
            {STATUS_STEPS.map((step, i) => {
              const done = currentStep >= i
              const isCancelled = result.status === 'cancelled' || result.status === 'failed'
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div
                    className={`h-2 flex-1 rounded-full transition-colors ${
                      isCancelled ? 'bg-wine-tint' : done ? 'bg-wine' : 'bg-cream border border-hairline'
                    }`}
                  />
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-stone flex-shrink-0" aria-hidden />
            <p className="font-body text-sm text-ink font-medium">
              {STATUS_LABELS[result.status] ?? result.status}
            </p>
          </div>

          <div className="border-t border-hairline pt-4 space-y-2">
            {result.lineItems.map((li, i) => (
              <div key={i} className="flex justify-between gap-2">
                <p className="font-body text-sm text-ink">
                  {li.name}
                  {li.quantity > 1 && <span className="ml-1 text-stone">x{li.quantity}</span>}
                </p>
                <p className="font-body text-sm text-stone flex-shrink-0">
                  PKR {Number(li.total).toLocaleString()}
                </p>
              </div>
            ))}
            <div className="flex justify-between gap-2 pt-1 border-t border-hairline">
              <p className="font-body text-sm font-semibold text-ink">Total</p>
              <p className="font-body text-sm font-semibold text-ink">
                PKR {Number(result.total).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
