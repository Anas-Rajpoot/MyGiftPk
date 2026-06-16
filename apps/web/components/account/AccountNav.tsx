'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { clsx } from 'clsx'
import { LayoutDashboard, ShoppingBag, User, MapPin, LogOut } from 'lucide-react'

interface Props {
  firstName: string
  email: string
}

const navLinks = [
  { href: '/account', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/account/orders', label: 'Orders', icon: ShoppingBag, exact: false },
  { href: '/account/profile', label: 'Profile', icon: User, exact: false },
  { href: '/account/track', label: 'Track Order', icon: MapPin, exact: false },
]

export function AccountNav({ firstName, email }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="w-full sm:w-52 flex-shrink-0">
      {/* User pill */}
      <div className="mb-4 p-4 rounded-card border border-hairline bg-ivory">
        <p className="font-body font-semibold text-sm text-ink truncate">
          {firstName || email.split('@')[0]}
        </p>
        <p className="font-body text-xs text-stone truncate mt-0.5">{email}</p>
      </div>

      <nav aria-label="Account navigation">
        <ul className="flex flex-col gap-0.5">
          {navLinks.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={clsx(
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-input font-body text-sm transition-colors',
                    active
                      ? 'bg-wine-tint text-wine font-semibold'
                      : 'text-ink hover:bg-cream hover:text-wine'
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" aria-hidden />
                  {label}
                </Link>
              </li>
            )
          })}

          <li className="mt-2 pt-2 border-t border-hairline">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 rounded-input font-body text-sm text-stone hover:text-wine hover:bg-cream transition-colors"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" aria-hidden />
              Sign out
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  )
}
