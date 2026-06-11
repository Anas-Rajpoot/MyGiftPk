'use client'

import { clsx } from 'clsx'
import { Minus, Plus } from 'lucide-react'

interface QtyStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
  className?: string
  ariaLabel?: string
}

export function QtyStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  className,
  ariaLabel = 'Quantity',
}: QtyStepperProps) {
  const decrement = () => { if (value > min) onChange(value - 1) }
  const increment = () => { if (value < max) onChange(value + 1) }

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={clsx(
        'inline-flex items-center rounded-input border border-hairline bg-ivory overflow-hidden',
        disabled && 'opacity-40',
        className
      )}
    >
      <button
        type="button"
        onClick={decrement}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
        className="h-10 w-10 flex items-center justify-center text-stone hover:text-wine hover:bg-wine-tint transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-wine"
      >
        <Minus className="h-3.5 w-3.5" aria-hidden />
      </button>
      <span
        aria-live="polite"
        className="w-10 text-center font-body text-base font-medium text-ink select-none tabular-nums"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={increment}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        className="h-10 w-10 flex items-center justify-center text-stone hover:text-wine hover:bg-wine-tint transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-wine"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  )
}
