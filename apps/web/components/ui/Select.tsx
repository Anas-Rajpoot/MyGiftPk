'use client'

import { clsx } from 'clsx'
import { ChevronDown } from 'lucide-react'
import type { SelectHTMLAttributes } from 'react'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: SelectOption[]
  placeholder?: string
  error?: string
  containerClassName?: string
}

export function Select({
  label,
  options,
  placeholder,
  error,
  id,
  className,
  containerClassName,
  disabled,
  ...props
}: SelectProps) {
  const selectId = id ?? `select-${label.toLowerCase().replace(/\s+/g, '-')}`
  const errorId = error ? `${selectId}-error` : undefined

  return (
    <div className={clsx('flex flex-col gap-1.5', containerClassName)}>
      <label htmlFor={selectId} className="font-body text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={clsx(
            'h-12 w-full appearance-none rounded-input border bg-ivory px-4 pr-10 font-body text-base text-ink',
            'transition-colors duration-150 outline-none cursor-pointer',
            'focus-visible:border-wine focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-1',
            error
              ? 'border-wine'
              : 'border-hairline hover:border-stone',
            disabled && 'opacity-40 cursor-not-allowed bg-cream',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone"
        />
      </div>
      {error && (
        <p id={errorId} role="alert" className="font-body text-xs text-wine">
          {error}
        </p>
      )}
    </div>
  )
}
