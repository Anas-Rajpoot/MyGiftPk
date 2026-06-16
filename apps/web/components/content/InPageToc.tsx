'use client'

import { useEffect, useState } from 'react'
import { clsx } from 'clsx'

interface TocItem {
  id: string
  text: string
}

interface InPageTocProps {
  items: TocItem[]
}

export function InPageToc({ items }: InPageTocProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0 }
    )

    items.forEach((item) => {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <nav aria-label="On this page" className="space-y-1">
      <p className="font-body text-xs font-semibold uppercase tracking-widest text-stone mb-3">
        On this page
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={clsx(
                'block font-body text-sm py-1 pl-3 border-l-2 transition-colors',
                activeId === item.id
                  ? 'border-wine text-wine font-medium'
                  : 'border-hairline text-stone hover:text-ink hover:border-stone'
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
