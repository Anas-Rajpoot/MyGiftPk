'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { CheckCircle2, Package, Truck, MessageCircle } from 'lucide-react'

function ConfirmationContent() {
  const params = useSearchParams()
  const orderNum = params.get('num') ?? params.get('id') ?? '—'
  const method = params.get('method') ?? 'cod'

  const isCod = method === 'cod'
  const isBacs = method === 'bacs'

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">

        {/* Success icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-wine-tint flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-wine" aria-hidden />
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-wide text-ink text-center mb-2">
          Order Placed!
        </h1>
        <p className="font-body text-stone text-center mb-8">
          Thank you for your order. We&apos;ll start preparing it right away.
        </p>

        {/* Order number card */}
        <div className="bg-ivory border border-hairline rounded-card px-6 py-5 text-center mb-6">
          <p className="font-body text-sm text-stone mb-1">Order number</p>
          <p className="font-display text-2xl tracking-wide text-wine">#{orderNum}</p>
          <p className="font-body text-xs text-stone mt-2">
            Save this number to track your order
          </p>
        </div>

        {/* Payment instructions */}
        {isCod && (
          <div className="bg-ivory border border-hairline rounded-card px-6 py-5 mb-6">
            <div className="flex items-start gap-3">
              <Truck className="h-5 w-5 text-wine shrink-0 mt-0.5" aria-hidden />
              <div>
                <p className="font-body text-sm font-semibold text-ink mb-1">Cash on Delivery</p>
                <p className="font-body text-sm text-stone leading-relaxed">
                  Please have the exact amount ready when our courier arrives. Orders are
                  typically delivered within 3–5 business days across Pakistan.
                </p>
              </div>
            </div>
          </div>
        )}

        {isBacs && (
          <div className="bg-ivory border border-hairline rounded-card px-6 py-5 mb-6">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-wine shrink-0 mt-0.5" aria-hidden />
              <div>
                <p className="font-body text-sm font-semibold text-ink mb-2">Complete your bank transfer</p>
                <div className="font-body text-sm text-stone space-y-1">
                  <p>Bank: <span className="text-ink font-medium">HBL</span></p>
                  <p>Account: <span className="text-ink font-medium">0123-4567890-01</span></p>
                  <p>Title: <span className="text-ink font-medium">MYGIFT (Pvt) Ltd</span></p>
                  <p className="text-wine font-medium mt-2">
                    Reference: Order #{orderNum}
                  </p>
                </div>
                <p className="font-body text-xs text-stone mt-3">
                  Your order ships once payment clears (1–2 business days).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* What happens next */}
        <div className="bg-ivory border border-hairline rounded-card px-6 py-5 mb-6">
          <p className="font-body text-xs uppercase tracking-[0.18em] text-stone font-semibold mb-4">
            What happens next
          </p>
          <ol className="space-y-4">
            {[
              { icon: CheckCircle2, title: 'Order confirmed', desc: 'We’ve received your order and sent a confirmation email.' },
              { icon: Package, title: 'Packed with care', desc: 'Your items are prepared and sealed for dispatch.' },
              { icon: Truck, title: 'On its way', desc: 'You’ll get a tracking link once your order ships.' },
            ].map(({ icon: Icon, title, desc }, i, arr) => (
              <li key={title} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-wine-tint flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-wine" aria-hidden />
                  </div>
                  {i < arr.length - 1 && <div className="w-px flex-1 bg-hairline mt-1" />}
                </div>
                <div className="pb-1">
                  <p className="font-body text-sm font-semibold text-ink">{title}</p>
                  <p className="font-body text-xs text-stone mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Confirmation email note */}
        <p className="font-body text-sm text-stone text-center mb-8">
          A confirmation email will be sent to your inbox shortly.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/shop"
            className="flex-1 h-12 flex items-center justify-center rounded-input bg-wine hover:bg-wine-deep text-ivory font-body font-medium text-[15px] transition-colors"
          >
            Continue Shopping
          </Link>
          <a
            href={`https://wa.me/923000000000?text=${encodeURIComponent(`Hi! I just placed order #${orderNum}. Can you confirm?`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-12 flex items-center justify-center gap-2 rounded-input border border-hairline hover:border-stone text-stone hover:text-ink font-body text-sm transition-colors"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            WhatsApp Us
          </a>
        </div>
      </div>
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-wine border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  )
}
