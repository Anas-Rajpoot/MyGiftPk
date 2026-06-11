import Link from 'next/link'
import type { AnnouncementBarData } from '@/lib/wp/queries/global'

export function AnnouncementBar({ data }: { data: AnnouncementBarData }) {
  const inner = (
    <span className="font-body text-xs sm:text-sm font-medium tracking-wide">
      {data.text}
    </span>
  )

  return (
    <div className="bg-ink text-ivory text-center py-2.5 px-4">
      {data.link ? (
        <Link href={data.link} className="hover:text-hairline transition-colors">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </div>
  )
}
