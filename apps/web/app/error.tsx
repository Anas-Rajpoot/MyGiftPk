'use client'

import Link from 'next/link'
import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to monitoring (Sentry etc.) when integrated
    console.error('[MYGIFT] Unhandled error:', error)
  }, [error])

  return (
    <div className="min-h-[70vh] bg-cream flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="font-display text-8xl sm:text-[120px] text-wine/10 leading-none select-none mb-0">
          500
        </p>
        <div className="-mt-4 mb-6">
          <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-wide text-ink leading-tight">
            Something Went Wrong
          </h1>
          <div className="mt-2 flex justify-center">
            <svg viewBox="0 0 120 10" className="h-2 w-28" aria-hidden>
              <path
                d="M0 5 Q30 0 60 5 Q90 10 120 5"
                fill="none"
                stroke="var(--wine)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M58 2 L60 6 L62 2"
                fill="none"
                stroke="var(--wine)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <p className="font-body text-base text-stone mb-8 leading-relaxed">
          An unexpected error occurred on our end. Our team has been notified.
          Please try again or return to the homepage.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center h-12 px-6 rounded-card bg-wine text-ivory font-body font-semibold text-sm tracking-wide hover:bg-wine-deep transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-12 px-6 rounded-card border border-wine text-wine font-body font-semibold text-sm tracking-wide hover:bg-wine-tint transition-colors"
          >
            Back to Home
          </Link>
        </div>

        <p className="mt-8 font-body text-xs text-stone">
          Still having issues?{' '}
          <Link href="/contact" className="text-wine underline underline-offset-2">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  )
}
