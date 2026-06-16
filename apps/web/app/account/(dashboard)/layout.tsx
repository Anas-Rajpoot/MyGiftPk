import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth/server'
import { AccountNav } from '@/components/account/AccountNav'

export const metadata: Metadata = {
  title: 'My Account',
  robots: { index: false },
}

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getAuthUser()
  if (!user) redirect('/account/login')

  return (
    <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <h1 className="font-display text-2xl sm:text-3xl uppercase tracking-wide text-ink mb-6">
        My Account
      </h1>

      <div className="flex flex-col sm:flex-row gap-6 sm:gap-10">
        <AccountNav firstName={user.firstName} email={user.email} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
