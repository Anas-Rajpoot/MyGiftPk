'use client'

import { useEffect, useRef, useState, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, X, ArrowRight, Loader2, CornerDownLeft, TrendingUp } from 'lucide-react'
import type { SearchResult } from '@/app/api/search/route'

interface Props {
  open: boolean
  onClose: () => void
}

// Quick-pick chips shown before the user types — on-brand discovery shortcuts
const POPULAR = [
  { label: 'Women', href: '/category/women' },
  { label: 'Men', href: '/category/men' },
  { label: 'Kids', href: '/category/kids' },
  { label: 'Gifts', href: '/gifts' },
  { label: 'Unstitched', href: '/shop?q=unstitched' },
]

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

// Inner component — only mounts when overlay is open, so state resets naturally on each open.
function SearchContent({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [isPending, startTransition] = useTransition()
  const debouncedQuery = useDebounce(query, 300)

  // Focus on mount
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 50) }, [])

  // Fetch on debounced query (setState only in async callback — not sync effect top-level)
  useEffect(() => {
    if (debouncedQuery.length < 2) return
    const controller = new AbortController()
    startTransition(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`, { signal: controller.signal })
        const d = await r.json()
        setResults(d.results ?? [])
        setActiveIndex(-1)
      } catch {
        if (!controller.signal.aborted) { setResults([]); setActiveIndex(-1) }
      }
    })
    return () => controller.abort()
  }, [debouncedQuery])

  // Close on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // Lock body scroll (cleanup on unmount restores overflow)
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const goToProduct = useCallback((slug: string) => {
    onClose()
    router.push(`/product/${slug}`)
  }, [onClose, router])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const q = query.trim()
      if (!q) return
      onClose()
      router.push(`/shop?q=${encodeURIComponent(q)}`)
    },
    [query, onClose, router]
  )

  // Arrow-key navigation through results
  const onInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (results.length === 0) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, -1))
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault()
        goToProduct(results[activeIndex].slug)
      }
    },
    [results, activeIndex, goToProduct]
  )

  const showResults = debouncedQuery.length >= 2 && results.length > 0
  const showEmpty = !isPending && debouncedQuery.length >= 2 && results.length === 0
  const showInitial = query.trim().length < 2

  return (
    <div className="max-w-[680px] mx-auto px-4 sm:px-6 pt-4 pb-3">
      {/* ── Search field ── */}
      <form onSubmit={handleSubmit} className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone pointer-events-none"
          aria-hidden
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder="Search for clothing, gifts…"
          className="w-full h-14 pl-12 pr-24 bg-cream rounded-input border border-hairline font-body text-base text-ink placeholder:text-stone outline-none transition-all duration-200 focus:bg-ivory focus:border-wine focus:ring-4 focus:ring-wine/10 [&::-webkit-search-cancel-button]:hidden"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={showResults}
          aria-controls="search-results"
          aria-label="Search products"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isPending && <Loader2 className="h-4 w-4 text-wine animate-spin" aria-hidden />}
          {query && !isPending && (
            <button
              type="button"
              onClick={() => { setQuery(''); inputRef.current?.focus() }}
              aria-label="Clear search"
              className="flex items-center justify-center w-7 h-7 text-stone hover:text-ink hover:bg-hairline/60 rounded-full transition-colors"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="hidden sm:flex items-center gap-1 h-7 pl-2 pr-2.5 text-[11px] font-body font-medium text-stone hover:text-ink border border-hairline rounded-input transition-colors"
          >
            ESC
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="sm:hidden flex items-center justify-center w-7 h-7 text-stone hover:text-ink rounded-full transition-colors"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </form>

      {/* ── Initial state: popular searches ── */}
      {showInitial && (
        <div className="mt-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-3.5 w-3.5 text-wine" aria-hidden />
            <span className="font-body text-[11px] uppercase tracking-[0.18em] text-stone font-semibold">
              Popular
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {POPULAR.map((p) => (
              <Link
                key={p.label}
                href={p.href}
                onClick={onClose}
                className="px-3.5 py-2 rounded-chip bg-cream border border-hairline font-body text-sm text-ink hover:border-wine hover:text-wine hover:bg-wine-tint transition-colors"
              >
                {p.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {showResults && (
        <div className="mt-4">
          <ul id="search-results" role="listbox" aria-label="Search results" className="space-y-0.5">
            {results.map((item, i) => (
              <li key={item.id} role="option" aria-selected={i === activeIndex}>
                <Link
                  href={`/product/${item.slug}`}
                  onClick={onClose}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex items-center gap-3.5 p-2.5 rounded-input transition-colors group ${
                    i === activeIndex ? 'bg-wine-tint' : 'hover:bg-cream'
                  }`}
                >
                  <div className="w-14 h-14 rounded-input bg-cream flex-shrink-0 overflow-hidden border border-hairline">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} width={56} height={56} className="object-cover w-full h-full" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-cream">
                        <Search className="h-4 w-4 text-hairline" aria-hidden />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-body text-[15px] truncate transition-colors ${i === activeIndex ? 'text-wine' : 'text-ink'}`}>
                      {item.name}
                    </p>
                    {item.price && (
                      <p className="font-body text-sm text-wine font-semibold mt-0.5">{item.price}</p>
                    )}
                  </div>
                  <ArrowRight
                    className={`h-4 w-4 flex-shrink-0 transition-all ${
                      i === activeIndex ? 'text-wine translate-x-0.5' : 'text-hairline group-hover:text-stone'
                    }`}
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>

          {/* View all CTA */}
          <Link
            href={`/shop?q=${encodeURIComponent(query.trim())}`}
            onClick={onClose}
            className="flex items-center justify-between mt-1.5 px-3 py-3 rounded-input border-t border-hairline font-body text-sm text-wine hover:bg-wine-tint transition-colors group"
          >
            <span className="flex items-center gap-2 font-medium">
              <Search className="h-4 w-4" aria-hidden />
              View all results for &ldquo;{query.trim()}&rdquo;
            </span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" aria-hidden />
          </Link>
        </div>
      )}

      {/* ── Empty state ── */}
      {showEmpty && (
        <div className="mt-4 py-10 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-cream border border-hairline flex items-center justify-center mb-3">
            <Search className="h-5 w-5 text-stone" aria-hidden />
          </div>
          <p className="font-body text-sm text-ink">
            No results for &ldquo;{query}&rdquo;
          </p>
          <p className="font-body text-xs text-stone mt-1">
            Try a different keyword or browse our collections.
          </p>
        </div>
      )}

      {/* ── Keyboard hint footer ── */}
      {(showResults || showInitial) && (
        <div className="hidden sm:flex items-center justify-end gap-4 mt-3 pt-3 border-t border-hairline">
          <span className="flex items-center gap-1.5 font-body text-[11px] text-stone">
            <kbd className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded bg-cream border border-hairline text-[10px] font-medium">↑</kbd>
            <kbd className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded bg-cream border border-hairline text-[10px] font-medium">↓</kbd>
            to navigate
          </span>
          <span className="flex items-center gap-1.5 font-body text-[11px] text-stone">
            <kbd className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded bg-cream border border-hairline">
              <CornerDownLeft className="h-3 w-3" aria-hidden />
            </kbd>
            to select
          </span>
        </div>
      )}
    </div>
  )
}

export function SearchOverlay({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-[2px]"
            aria-hidden
            onClick={onClose}
          />
          <motion.div
            key="search-panel"
            initial={{ opacity: 0, y: -16, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.99 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 left-0 right-0 z-50 bg-ivory border-b border-hairline shadow-[var(--shadow-float)]"
            role="dialog"
            aria-label="Search"
            aria-modal="true"
          >
            <SearchContent onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
