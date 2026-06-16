import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getAuthUser } from '@/lib/auth/server'
import { AuthShell } from '@/components/account/AuthShell'
import { AuthError } from '@/components/account/AuthError'
import { SocialAuthButtons } from '@/components/account/SocialAuthButtons'
import { RegisterForm } from '@/components/account/RegisterForm'

export const metadata: Metadata = {
  title: 'Create Account',
  robots: { index: false, follow: false },
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const user = await getAuthUser()
  if (user) redirect('/account')

  const sp = await searchParams

  return (
    <AuthShell title="Create account" subtitle="Join MYGIFT to track orders and save your favourites.">
      <Suspense>
        <AuthError />
      </Suspense>
      <SocialAuthButtons next={sp.next} />
      <div className="mt-5">
        <RegisterForm />
      </div>
    </AuthShell>
  )
}
