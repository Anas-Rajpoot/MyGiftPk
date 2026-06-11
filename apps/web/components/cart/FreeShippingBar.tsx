import { clsx } from 'clsx'

interface FreeShippingBarProps {
  threshold: number
  remaining: number
}

export function FreeShippingBar({ threshold, remaining }: FreeShippingBarProps) {
  const pct = Math.min(100, Math.round(((threshold - remaining) / threshold) * 100))
  const achieved = remaining === 0

  return (
    <div className="px-5 py-3 bg-cream border-b border-hairline">
      <p className="font-body text-xs text-stone mb-1.5">
        {achieved ? (
          <span className="text-success font-medium">
            🎉 You&apos;ve unlocked free shipping!
          </span>
        ) : (
          <>
            Add{' '}
            <span className="text-ink font-medium">
              Rs. {remaining.toLocaleString('en-PK')}
            </span>{' '}
            more for free shipping
          </>
        )}
      </p>
      <div className="h-1.5 w-full bg-hairline rounded-full overflow-hidden">
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-500',
            achieved ? 'bg-success' : 'bg-wine'
          )}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Free shipping progress: ${pct}%`}
        />
      </div>
    </div>
  )
}
