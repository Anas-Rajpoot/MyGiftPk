import { Truck, Gift, ShieldCheck, MapPin } from 'lucide-react'
import type { TrustItem } from '@/lib/wp/queries/home'

const iconMap: Record<string, React.FC<{ className?: string; 'aria-hidden'?: boolean }>> = {
  truck: Truck,
  gift: Gift,
  'shield-check': ShieldCheck,
  'map-pin': MapPin,
}

export function TrustRow({ items }: { items: TrustItem[] }) {
  return (
    <section aria-label="Why shop with us" className="border-y border-hairline bg-ivory py-10 sm:py-12">
      <div className="max-w-[1320px] mx-auto px-6">
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 list-none p-0 m-0">
          {items.map((item) => {
            const Icon = iconMap[item.icon] ?? Gift
            return (
              <li key={item.icon} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="flex items-center justify-center w-11 h-11 rounded-full bg-wine-tint shrink-0">
                  <Icon className="h-5 w-5 text-wine" aria-hidden />
                </div>
                <div>
                  <p className="font-body font-semibold text-ink text-sm">{item.heading}</p>
                  <p className="font-body text-stone text-xs mt-0.5 leading-snug">{item.subtext}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
