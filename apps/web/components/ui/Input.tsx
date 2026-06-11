'use client'

import { clsx } from 'clsx'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
  containerClassName?: string
}

export function Input({
  label,
  error,
  hint,
  id,
  className,
  containerClassName,
  disabled,
  ...props
}: InputProps) {
  const inputId = id ?? `input-${label.toLowerCase().replace(/\s+/g, '-')}`
  const errorId = error ? `${inputId}-error` : undefined
  const hintId = hint ? `${inputId}-hint` : undefined

  return (
    <div className={clsx('flex flex-col gap-1.5', containerClassName)}>
      <label
        htmlFor={inputId}
        className="font-body text-sm font-medium text-ink"
      >
        {label}
      </label>
      <input
        id={inputId}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={[errorId, hintId].filter(Boolean).join(' ') || undefined}
        className={clsx(
          'h-12 w-full rounded-input border bg-ivory px-4 font-body text-base text-ink placeholder:text-stone',
          'transition-colors duration-150 outline-none',
          'focus-visible:border-wine focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-1',
          error
            ? 'border-wine text-wine placeholder:text-wine/60'
            : 'border-hairline hover:border-stone',
          disabled && 'opacity-40 cursor-not-allowed bg-cream',
          className
        )}
        {...props}
      />
      {hint && !error && (
        <p id={hintId} className="font-body text-xs text-stone">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="font-body text-xs text-wine">
          {error}
        </p>
      )}
    </div>
  )
}
