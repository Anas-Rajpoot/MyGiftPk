'use client'

import dynamic from 'next/dynamic'
import type { GiftBuilderOptions } from '@/lib/wp/queries/gift'

function Skeleton() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="h-20 bg-ivory border-b border-hairline" />
      <div className="px-4 pt-6 space-y-4">
        <div className="h-7 w-48 rounded skeleton-shimmer" />
        <div className="h-4 w-64 rounded skeleton-shimmer" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-card overflow-hidden border border-hairline">
              <div className="aspect-square skeleton-shimmer" />
              <div className="p-4 space-y-2">
                <div className="h-5 w-32 rounded skeleton-shimmer" />
                <div className="h-3 w-24 rounded skeleton-shimmer" />
                <div className="h-4 w-20 rounded skeleton-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const Shell = dynamic(
  () => import('@/components/gift/GiftBuilderShell').then((m) => m.GiftBuilderShell),
  { ssr: false, loading: () => <Skeleton /> }
)

export function GiftBuilderLoader({ options }: { options: GiftBuilderOptions }) {
  return <Shell options={options} />
}
