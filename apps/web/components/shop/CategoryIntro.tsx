'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { clsx } from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'

interface CategoryIntroProps {
  name: string
  intro: string
  count: number
}

const TRUNCATE_LINES = 3

export function CategoryIntro({ name, intro, count }: CategoryIntroProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="font-display text-2xl sm:text-3xl uppercase tracking-wide text-ink">
          {name}
        </h1>
        <span className="font-body text-sm text-stone shrink-0">{count} products</span>
      </div>

      {intro && (
        <div>
          <AnimatePresence initial={false}>
            <motion.p
              key={expanded ? 'expanded' : 'collapsed'}
              initial={false}
              className={clsx(
                'font-body text-sm text-stone leading-relaxed',
                !expanded && 'line-clamp-' + TRUNCATE_LINES
              )}
            >
              {intro}
            </motion.p>
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 flex items-center gap-1 text-[13px] text-wine font-body hover:underline focus-visible:outline-none focus-visible:underline"
            aria-expanded={expanded}
          >
            {expanded ? 'Show less' : 'Read more'}
            <ChevronDown
              className={clsx(
                'h-3.5 w-3.5 transition-transform duration-200',
                expanded && 'rotate-180'
              )}
              aria-hidden
            />
          </button>
        </div>
      )}
    </div>
  )
}
