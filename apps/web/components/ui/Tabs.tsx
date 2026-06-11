'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

interface TabsProps {
  tabs: Tab[]
  defaultTabId?: string
  className?: string
}

export function Tabs({ tabs, defaultTabId, className }: TabsProps) {
  const [activeId, setActiveId] = useState(defaultTabId ?? tabs[0]?.id ?? '')

  const active = tabs.find((t) => t.id === activeId)

  return (
    <div className={clsx('flex flex-col gap-0', className)}>
      {/* Tab list */}
      <div
        role="tablist"
        className="flex border-b border-hairline overflow-x-auto scrollbar-none"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeId
          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => setActiveId(tab.id)}
              tabIndex={isActive ? 0 : -1}
              className={clsx(
                'relative shrink-0 px-5 py-3 font-body text-sm font-medium transition-colors duration-150 whitespace-nowrap',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-inset',
                isActive ? 'text-wine' : 'text-stone hover:text-ink'
              )}
            >
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-wine"
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                />
              )}
            </button>
          )
        })}
      </div>
      {/* Panel */}
      {active && (
        <div
          role="tabpanel"
          id={`tabpanel-${active.id}`}
          aria-labelledby={`tab-${active.id}`}
          className="pt-4"
        >
          {active.content}
        </div>
      )}
    </div>
  )
}
