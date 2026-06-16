'use client'

import { useState } from 'react'
import { ChevronDown, Truck, Package, RefreshCw, ShieldCheck, BadgeCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-hairline last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-5 group"
      >
        <div className="flex items-center gap-3">
          <div className="h-[2px] w-8 bg-wine rounded-full transition-all duration-300 group-hover:w-12" />
          <span className="font-body text-[11px] uppercase tracking-[0.28em] text-stone group-hover:text-ink transition-colors">
            {label}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-stone shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-7 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const RICH_TEXT_CLS = [
  'text-stone',
  '[&_p]:font-body [&_p]:text-sm [&_p]:leading-[1.9] [&_p]:mb-4 [&_p:last-child]:mb-0',
  '[&_h1]:font-display [&_h1]:text-2xl [&_h1]:uppercase [&_h1]:text-ink [&_h1]:leading-none [&_h1]:mb-4 [&_h1]:mt-10 [&_h1:first-child]:mt-0',
  '[&_h2]:font-display [&_h2]:text-xl [&_h2]:uppercase [&_h2]:text-ink [&_h2]:leading-none [&_h2]:mb-3 [&_h2]:mt-8 [&_h2:first-child]:mt-0',
  '[&_h3]:font-body [&_h3]:text-[13px] [&_h3]:font-semibold [&_h3]:text-ink [&_h3]:mb-2 [&_h3]:mt-6 [&_h3:first-child]:mt-0',
  '[&_ul]:mb-5 [&_ul]:space-y-2',
  '[&_ul_li]:font-body [&_ul_li]:text-sm [&_ul_li]:leading-relaxed [&_ul_li]:flex [&_ul_li]:items-start [&_ul_li]:gap-2',
  '[&_ul_li]:before:content-["—"] [&_ul_li]:before:text-wine [&_ul_li]:before:font-semibold [&_ul_li]:before:shrink-0 [&_ul_li]:before:leading-relaxed',
  '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-5 [&_ol]:space-y-2',
  '[&_ol_li]:font-body [&_ol_li]:text-sm [&_ol_li]:leading-relaxed',
  '[&_strong]:font-semibold [&_strong]:text-ink',
  '[&_em]:italic',
  '[&_a]:text-wine [&_a]:underline [&_a:hover]:text-wine-deep',
  '[&_blockquote]:border-l-[3px] [&_blockquote]:border-wine [&_blockquote]:pl-5 [&_blockquote]:py-1 [&_blockquote]:italic [&_blockquote]:my-6',
  '[&_table]:w-full [&_table]:text-sm [&_table]:border-collapse [&_table]:mb-6',
  '[&_th]:text-left [&_th]:font-body [&_th]:font-semibold [&_th]:text-ink [&_th]:border-b [&_th]:border-hairline [&_th]:pb-2 [&_th]:pr-6',
  '[&_td]:font-body [&_td]:border-b [&_td]:border-hairline/50 [&_td]:py-2.5 [&_td]:pr-6',
].join(' ')

interface Props {
  description: string
  firstCat?: { name: string; slug: string } | null
}

export function ProductAccordions({ description, firstCat }: Props) {
  return (
    <div>
      {/* 1 — Product Details */}
      <Row label="Product Details">
        <div
          className={RICH_TEXT_CLS}
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </Row>

      {/* 2 — Delivery & Returns */}
      <Row label="Delivery & Returns">
        <div className="space-y-3 max-w-xl">
          {[
            { icon: Truck,       title: 'Free Delivery',         body: 'On all orders over Rs. 3,000 across Pakistan.' },
            { icon: Package,     title: 'Standard Delivery',     body: '3–5 business days nationwide.' },
            { icon: RefreshCw,   title: '7-Day Returns',         body: 'Unused items in original packaging accepted within 7 days.' },
            { icon: ShieldCheck, title: 'Cash on Delivery',      body: 'Available on eligible orders at checkout.' },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-input bg-wine-tint flex items-center justify-center shrink-0">
                <Icon className="h-3.5 w-3.5 text-wine" aria-hidden />
              </div>
              <div>
                <p className="font-body text-sm font-semibold text-ink">{title}</p>
                <p className="font-body text-xs text-stone leading-relaxed mt-0.5">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </Row>

      {/* 3 — Authenticity */}
      <Row label="Authenticity & Care">
        <div className="space-y-4 max-w-xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-input bg-wine-tint flex items-center justify-center shrink-0">
              <BadgeCheck className="h-3.5 w-3.5 text-wine" aria-hidden />
            </div>
            <div>
              <p className="font-body text-sm font-semibold text-ink">100% Authentic</p>
              <p className="font-body text-xs text-stone leading-relaxed mt-0.5">
                Every item is sourced directly from verified suppliers. We guarantee authenticity on every purchase.
              </p>
            </div>
          </div>

          {firstCat && (
            <div className="flex items-center gap-3 pt-1">
              <p className="font-body text-xs text-stone">Browse more in</p>
              <Link
                href={`/category/${firstCat.slug}`}
                className="font-body text-xs font-semibold text-wine hover:text-wine-deep underline underline-offset-2 transition-colors"
              >
                {firstCat.name}
              </Link>
            </div>
          )}
        </div>
      </Row>
    </div>
  )
}
