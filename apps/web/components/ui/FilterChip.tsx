'use client'

import { clsx } from 'clsx'

interface FilterChipProps {
  label: string
  selected?: boolean
  onToggle?: () => void
  onRemove?: () => void
  className?: string
}

export function FilterChip({ label, selected = false, onToggle, onRemove, className }: FilterChipProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={clsx(
        'inline-flex items-center gap-1.5 h-9 px-4 rounded-chip text-sm font-body font-medium transition-colors duration-150',
        'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-1',
        selected
          ? 'bg-wine-tint text-wine border-wine'
          : 'bg-ivory text-ink border-hairline hover:border-stone',
        className
      )}
    >
      {label}
      {selected && onRemove && (
        <span
          role="button"
          aria-label={`Remove ${label} filter`}
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onRemove() } }}
          className="ml-0.5 text-wine opacity-70 hover:opacity-100 cursor-pointer"
        >
          ×
        </span>
      )}
    </button>
  )
}
