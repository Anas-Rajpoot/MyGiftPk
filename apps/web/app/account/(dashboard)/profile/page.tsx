import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth/server'
import { ProfileForm } from '@/components/account/ProfileForm'

export const metadata: Metadata = {
  title: 'Profile',
  robots: { index: false },
}

export default async function ProfilePage() {
  const user = await getAuthUser()
  if (!user) redirect('/account/login')

  return (
    <div>
      <h2 className="font-display text-xl uppercase tracking-wide text-ink mb-5">
        Profile
      </h2>
      <ProfileForm user={{ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }} />
    </div>
  )
}
