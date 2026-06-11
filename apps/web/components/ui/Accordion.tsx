'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { clsx } from 'clsx'

interface AccordionItem {
  id: string
  title: string
  content: React.ReactNode
}

interface AccordionProps {
  items: AccordionItem[]
  defaultOpenId?: string
  className?: string
}

export function Accordion({ items, defaultOpenId, className }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null)
  const shouldReduceMotion = useReducedMotion()

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id))

  return (
    <div className={clsx('divide-y divide-hairline border-t border-hairline', className)}>
      {items.map((item) => {
        const isOpen = openId === item.id
        return (
          <div key={item.id}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`accordion-${item.id}`}
              id={`accordion-trigger-${item.id}`}
              onClick={() => toggle(item.id)}
              className="w-full flex items-center justify-between py-4 text-left font-body font-medium text-ink hover:text-wine transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine rounded px-1"
            >
              <span>{item.title}</span>
              <ChevronDown
                aria-hidden
                className={clsx(
                  'h-4 w-4 text-stone shrink-0 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`accordion-${item.id}`}
                  role="region"
                  aria-labelledby={`accordion-trigger-${item.id}`}
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: 'easeOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="pb-4 font-body text-stone text-sm leading-relaxed px-1">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
