import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false },
}

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-cream flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Decorative ribbon accent */}
        <p className="font-display text-8xl sm:text-[120px] text-wine/10 leading-none select-none mb-0">
          404
        </p>
        <div className="-mt-4 mb-6">
          <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-wide text-ink leading-tight">
            Page Not Found
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
          The page you&apos;re looking for has moved, been removed, or might just be taking a chai break.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-12 px-6 rounded-card bg-wine text-ivory font-body font-semibold text-sm tracking-wide hover:bg-wine-deep transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center h-12 px-6 rounded-card border border-wine text-wine font-body font-semibold text-sm tracking-wide hover:bg-wine-tint transition-colors"
          >
            Browse Shop
          </Link>
        </div>

        <p className="mt-8 font-body text-xs text-stone">
          Need help?{' '}
          <Link href="/contact" className="text-wine underline underline-offset-2">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  )
}
