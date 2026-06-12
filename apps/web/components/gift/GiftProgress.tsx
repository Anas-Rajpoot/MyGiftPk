'use client'

import { clsx } from 'clsx'
import { Check } from 'lucide-react'

const STEPS = ['Choose Box', 'Fill It', 'Personalise', 'Review']

interface GiftProgressProps {
  step: 1 | 2 | 3 | 4
}

export function GiftProgress({ step }: GiftProgressProps) {
  return (
    <nav aria-label="Gift builder progress" className="bg-ivory border-b border-hairline px-4 py-3">
      <ol className="flex items-start">
        {STEPS.map((label, i) => {
          const num = (i + 1) as 1 | 2 | 3 | 4
          const isDone = num < step
          const isCurrent = num === step
          return (
            <li key={num} className={clsx('flex items-start', i < 3 && 'flex-1')}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={clsx(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium font-body transition-colors',
                    isDone
                      ? 'bg-gold text-ivory'
                      : isCurrent
                      ? 'bg-gold text-ivory ring-2 ring-gold ring-offset-2 ring-offset-ivory'
                      : 'bg-hairline text-stone'
                  )}
                >
                  {isDone ? (
                    <Check className="h-3.5 w-3.5" aria-hidden />
                  ) : (
                    num
                  )}
                </div>
                <span
                  className={clsx(
                    'text-[10px] font-body leading-none whitespace-nowrap',
                    isDone || isCurrent ? 'text-gold font-medium' : 'text-stone'
                  )}
                >
                  {label}
                </span>
              </div>
              {i < 3 && (
                <div
                  className={clsx(
                    'h-px flex-1 mx-1.5 mt-3.5 transition-colors',
                    isDone ? 'bg-gold' : 'bg-hairline'
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
