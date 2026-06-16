import { clsx } from 'clsx'
import { Info, AlertTriangle } from 'lucide-react'

interface CalloutProps {
  variant?: 'info' | 'warning'
  title?: string
  children: React.ReactNode
  className?: string
}

export function Callout({ variant = 'info', title, children, className }: CalloutProps) {
  const isWarning = variant === 'warning'
  return (
    <div
      className={clsx(
        'flex gap-3 rounded-card p-4 border',
        isWarning ? 'bg-[var(--wine-tint)] border-[color:var(--wine)]/30' : 'bg-cream border-hairline',
        className
      )}
    >
      <div className={clsx('shrink-0 mt-0.5', isWarning ? 'text-wine' : 'text-stone')}>
        {isWarning ? (
          <AlertTriangle className="h-5 w-5" aria-hidden />
        ) : (
          <Info className="h-5 w-5" aria-hidden />
        )}
      </div>
      <div>
        {title && (
          <p className="font-body font-semibold text-sm text-ink mb-1">{title}</p>
        )}
        <div className="font-body text-sm text-stone leading-relaxed">{children}</div>
      </div>
    </div>
  )
}
