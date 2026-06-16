import { getAuthUser } from '@/lib/auth/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShoppingBag, User, MapPin, Gift } from 'lucide-react'

export default async function AccountDashboard() {
  const user = await getAuthUser()
  if (!user) redirect('/account/login')

  const tiles = [
    {
      href: '/account/orders',
      icon: ShoppingBag,
      label: 'Orders',
      description: 'View your order history and status',
    },
    {
      href: '/account/profile',
      icon: User,
      label: 'Profile',
      description: 'Update your name and account details',
    },
    {
      href: '/account/track',
      icon: MapPin,
      label: 'Track an Order',
      description: 'Look up any order by number and phone',
    },
    {
      href: '/gift-builder',
      icon: Gift,
      label: 'Gift Builder',
      description: 'Create a custom gift box for someone special',
    },
  ]

  return (
    <div>
      <p className="font-body text-base text-stone mb-6">
        Welcome back,{' '}
        <span className="font-semibold text-ink">{user.firstName || user.email.split('@')[0]}</span>.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tiles.map(({ href, icon: Icon, label, description }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-start gap-4 p-5 rounded-card border border-hairline bg-ivory hover:border-wine hover:bg-wine-tint transition-colors"
          >
            <div className="mt-0.5 flex-shrink-0 w-9 h-9 rounded-input bg-cream group-hover:bg-wine-tint flex items-center justify-center">
              <Icon className="h-5 w-5 text-wine" aria-hidden />
            </div>
            <div>
              <p className="font-body font-semibold text-sm text-ink group-hover:text-wine transition-colors">
                {label}
              </p>
              <p className="font-body text-xs text-stone mt-0.5 leading-relaxed">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
