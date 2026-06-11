import { clsx } from 'clsx'

interface SkeletonProps {
  className?: string
  rounded?: 'none' | 'sm' | 'card' | 'full'
}

/* shimmer animation defined in globals.css via @keyframes */
export function Skeleton({ className, rounded = 'sm' }: SkeletonProps) {
  const radiusClass = {
    none: 'rounded-none',
    sm: 'rounded',
    card: 'rounded-card',
    full: 'rounded-full',
  }[rounded]

  return (
    <div
      aria-hidden
      className={clsx('skeleton-shimmer bg-cream', radiusClass, className)}
    />
  )
}

/* Preset skeleton shapes for common use cases */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={clsx('space-y-2', className)} aria-hidden>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={clsx('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  )
}

export function SkeletonProductCard({ className }: { className?: string }) {
  return (
    <div className={clsx('space-y-3', className)} aria-hidden>
      {/* 3:4 image */}
      <Skeleton rounded="card" className="w-full aspect-[3/4]" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  )
}
