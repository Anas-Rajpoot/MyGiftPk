'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Gift } from 'lucide-react'

const DISMISS_KEY = 'mygift-auth-nudge-dismissed'
const TIME_THRESHOLD_MS = 25_000 // appear after ~25s on site…
const SCROLL_RATIO = 0.55 // …or once the user scrolls past ~55% of the page

/**
 * A subtle, dismissible "create an account" nudge.
 * - Never shown to logged-in users, nor on /account or /checkout pages
 * - Appears only after a real engagement signal (time OR scroll depth)
 * - Auth status is checked lazily at trigger time (keeps pages statically rendered)
 * - Once dismissed, stays gone for the rest of the browser session
 */
export function AuthNudge() {
  const pathname = usePathname()
  const [show, setShow] = useState(false)

  const hiddenRoute =
    pathname.startsWith('/account') || pathname.startsWith('/checkout')

  useEffect(() => {
    if (hiddenRoute) return
    if (typeof window === 'undefined') return
    try {
      if (sessionStorage.getItem(DISMISS_KEY)) return
    } catch {
      return
    }

    let fired = false
    function cleanup() {
      clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
    }
    async function trigger() {
      if (fired) return
      fired = true
      cleanup()
      // Only nudge guests — check auth lazily so logged-in users are never bothered
      try {
        const res = await fetch('/api/account/profile')
        if (res.ok) return // already signed in
      } catch {
        /* network issue — fail open and still offer sign-in */
      }
      setShow(true)
    }
    function onScroll() {
      const reached =
        (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight
      if (reached >= SCROLL_RATIO) trigger()
    }

    const timer = setTimeout(trigger, TIME_THRESHOLD_MS)
    window.addEventListener('scroll', onScroll, { passive: true })
    return cleanup
  }, [hiddenRoute])

  function dismiss() {
    setShow(false)
    try {
      sessionStorage.setItem(DISMISS_KEY, '1')
    } catch {
      /* ignore */
    }
  }

  return (
    <AnimatePresence>
      {show && !hiddenRoute && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-4 right-4 z-40 sm:left-6 sm:right-auto sm:max-w-sm"
          role="dialog"
          aria-label="Create a MYGIFT account"
        >
          <div className="relative rounded-card border border-hairline bg-ivory shadow-[var(--shadow-float)] p-5 pr-10">
            <button
              type="button"
              onClick={dismiss}
              aria-label="Dismiss"
              className="absolute top-3 right-3 flex items-center justify-center w-7 h-7 rounded-full text-stone hover:text-ink hover:bg-cream transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>

            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gold-tint shrink-0">
                <Gift className="h-5 w-5 text-gold" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="font-display text-lg uppercase tracking-wide text-ink leading-none">
                  Save your favourites
                </p>
                <p className="font-body text-sm text-stone mt-1.5 leading-relaxed">
                  Create a free account to track orders, save favourites, and build
                  gift boxes faster.
                </p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Link
                href="/account/register"
                onClick={dismiss}
                className="flex-1 inline-flex items-center justify-center h-10 rounded-input bg-wine text-ivory font-body font-semibold text-sm hover:bg-wine-deep transition-colors"
              >
                Create account
              </Link>
              <Link
                href="/account/login"
                onClick={dismiss}
                className="inline-flex items-center justify-center h-10 px-4 rounded-input border border-hairline text-ink font-body font-medium text-sm hover:bg-cream hover:text-wine transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
