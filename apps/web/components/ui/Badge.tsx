import { clsx } from 'clsx'

type BadgeVariant = 'sale' | 'new' | 'gift'

interface BadgeProps {
  variant: BadgeVariant
  className?: string
}

const styles: Record<BadgeVariant, string> = {
  sale: 'bg-wine-tint text-wine',
  new: 'bg-ink text-ivory',
  gift: 'bg-gold-tint text-gold',
}

const labels: Record<BadgeVariant, string> = {
  sale: 'Sale',
  new: 'New',
  gift: '🎀 Gift',
}

export function Badge({ variant, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-chip text-xs font-body font-semibold tracking-wide uppercase',
        styles[variant],
        className
      )}
    >
      {labels[variant]}
    </span>
  )
}
