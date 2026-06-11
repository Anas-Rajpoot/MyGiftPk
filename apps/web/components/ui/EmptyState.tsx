import Link from 'next/link'
import { clsx } from 'clsx'

interface EmptyStateProps {
  icon?: React.ReactNode
  heading: string
  description?: string
  cta?: {
    label: string
    href: string
  }
  className?: string
}

/* Default icon: open box outline */
function BoxIcon() {
  return (
    <svg
      width={48}
      height={48}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 16l18-8 18 8v20l-18 8L6 36V16z" />
      <path d="M6 16l18 8 18-8M24 24v16" />
      <path d="M15 11.5L33 20" />
    </svg>
  )
}

export function EmptyState({ icon, heading, description, cta, className }: EmptyStateProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center text-center gap-4 py-16 px-6',
        className
      )}
    >
      <div className="text-stone">{icon ?? <BoxIcon />}</div>
      <h3 className="font-body font-semibold text-ink text-lg">{heading}</h3>
      {description && (
        <p className="font-body text-stone text-sm max-w-xs">{description}</p>
      )}
      {cta && (
        <Link
          href={cta.href}
          className="mt-2 inline-flex items-center gap-1 px-6 h-12 bg-wine text-ivory rounded-input font-body font-semibold text-[15px] tracking-wide hover:bg-wine-deep transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-2"
        >
          {cta.label}
        </Link>
      )}
    </div>
  )
}
