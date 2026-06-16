import Link from 'next/link'
import { clsx } from 'clsx'
import { TIMELINE_STEPS, getStepIndex } from '@/lib/woo/order-status'
import type { TrackOrderResult } from '@/lib/woo/order-status'

function formatTs(iso: string): string {
  return new Date(iso).toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

interface OrderTimelineProps {
  order: TrackOrderResult
}

export function OrderTimeline({ order }: OrderTimelineProps) {
  // Cancelled state — show banner instead of timeline
  if (order.cancelled) {
    return (
      <div className="rounded-card border border-wine/30 bg-[var(--wine-tint)] p-4 flex items-start gap-3">
        <svg className="h-5 w-5 shrink-0 text-wine mt-0.5" viewBox="0 0 20 20" fill="none" aria-hidden>
          <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 6v4M10 14h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <div>
          <p className="font-body font-semibold text-sm text-wine">
            Order {order.wooStatus === 'refunded' ? 'Refunded' : 'Cancelled or Issue'}
          </p>
          <p className="font-body text-xs text-stone mt-1">
            Please contact us at{' '}
            <Link href="/contact" className="underline underline-offset-2">help &amp; support</Link>{' '}
            if you need assistance.
          </p>
        </div>
      </div>
    )
  }

  const currentIndex = getStepIndex(order.status)

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[320px] flex items-start justify-between relative py-2">
        {/* Background connector line */}
        <div className="absolute top-[18px] left-[20px] right-[20px] h-0.5 bg-hairline" aria-hidden />

        {/* Wine-filled completed portion */}
        {currentIndex > 0 && (
          <div
            aria-hidden
            className="absolute top-[18px] left-[20px] h-0.5 bg-wine transition-all duration-500"
            style={{ width: `calc(${(currentIndex / (TIMELINE_STEPS.length - 1)) * 100}% - 0px)` }}
          />
        )}

        {TIMELINE_STEPS.map(({ key, label }, i) => {
          const isDone    = i < currentIndex
          const isCurrent = i === currentIndex
          const isFuture  = i > currentIndex
          const ts        = order.timestamps?.[key]

          return (
            <div
              key={key}
              className="relative flex flex-col items-center gap-1.5 z-10"
              style={{ flex: '1 1 0', maxWidth: `${100 / TIMELINE_STEPS.length}%` }}
            >
              {/* Step circle */}
              <div
                className={clsx(
                  'w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors duration-300',
                  isDone    && 'bg-wine border-wine',
                  isCurrent && 'bg-wine border-wine relative',
                  isFuture  && 'bg-ivory border-hairline'
                )}
              >
                {isCurrent && (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full border-2 border-wine animate-ping opacity-40"
                  />
                )}
                {isDone ? (
                  <svg className="h-4 w-4 text-ivory" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span
                    className={clsx(
                      'w-2.5 h-2.5 rounded-full',
                      isCurrent ? 'bg-ivory' : 'bg-hairline'
                    )}
                  />
                )}
              </div>

              {/* Label */}
              <span
                className={clsx(
                  'font-body text-xs text-center leading-tight',
                  (isDone || isCurrent) ? 'text-ink font-medium' : 'text-stone'
                )}
              >
                {label}
              </span>

              {/* Timestamp */}
              {ts && (
                <span className="font-body text-[10px] text-stone text-center leading-tight">
                  {formatTs(ts)}
                </span>
              )}

              {/* Current WC status badge */}
              {isCurrent && !ts && (
                <span className="font-body text-[10px] text-wine uppercase tracking-wider">
                  {order.wooStatus}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Tracking card */}
      {(order.trackingNumber || order.courierName) && (
        <div className="mt-4 p-3 rounded-card bg-ivory border border-hairline space-y-1">
          {order.courierName && (
            <p className="font-body text-sm text-ink">
              <span className="text-stone">Courier: </span>{order.courierName}
            </p>
          )}
          {order.trackingNumber && (
            <p className="font-body text-sm text-ink">
              <span className="text-stone">Tracking #: </span>
              {order.trackingUrl ? (
                <a
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-wine underline underline-offset-2 hover:text-[var(--wine-deep)]"
                >
                  {order.trackingNumber}
                </a>
              ) : (
                order.trackingNumber
              )}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
