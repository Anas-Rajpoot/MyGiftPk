'use client'

import { useState } from 'react'
import { FilterChip } from '@/components/ui/FilterChip'
import { Accordion } from '@/components/ui/Accordion'
import type { FaqItem } from '@/lib/wp/queries/pages'

interface FaqsClientProps {
  items: FaqItem[]
}

export function FaqsClient({ items }: FaqsClientProps) {
  const categories = Array.from(new Set(items.map((i) => i.category))).filter(Boolean)
  const [active, setActive] = useState<string>('All')

  const filtered = active === 'All' ? items : items.filter((i) => i.category === active)

  // Group filtered items by category for display
  const groups: Record<string, FaqItem[]> = {}
  if (active === 'All') {
    for (const item of filtered) {
      if (!groups[item.category]) groups[item.category] = []
      groups[item.category].push(item)
    }
  } else {
    groups[active] = filtered
  }

  return (
    <div className="max-w-[760px] space-y-8">
      {/* Category chips */}
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filter FAQs by category"
      >
        <FilterChip
          label="All"
          selected={active === 'All'}
          onToggle={() => setActive('All')}
        />
        {categories.map((cat) => (
          <FilterChip
            key={cat}
            label={cat}
            selected={active === cat}
            onToggle={() => setActive(active === cat ? 'All' : cat)}
          />
        ))}
      </div>

      {/* Accordion groups */}
      {Object.entries(groups).map(([category, groupItems]) => (
        <section key={category} aria-labelledby={`faq-group-${category}`}>
          <h2
            id={`faq-group-${category}`}
            className="font-display text-xl uppercase text-ink mb-4"
          >
            {category}
          </h2>
          <Accordion
            items={groupItems.map((item, i) => ({
              id: `${category}-${i}`,
              title: item.question,
              content: (
                <span dangerouslySetInnerHTML={{ __html: item.answer }} />
              ),
            }))}
            defaultOpenId={`${category}-0`}
          />
        </section>
      ))}

      {filtered.length === 0 && (
        <p className="font-body text-stone text-sm">No questions found in this category.</p>
      )}
    </div>
  )
}
