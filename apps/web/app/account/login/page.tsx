import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getAuthUser } from '@/lib/auth/server'
import { AuthShell } from '@/components/account/AuthShell'
import { AuthError } from '@/components/account/AuthError'
import { SocialAuthButtons } from '@/components/account/SocialAuthButtons'
import { LoginForm } from '@/components/account/LoginForm'

export const metadata: Metadata = {
  title: 'Sign In',
  robots: { index: false, follow: false },
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; redirect?: string }>
}) {
  const user = await getAuthUser()
  if (user) redirect('/account')

  const sp = await searchParams
  const next = sp.next ?? sp.redirect

  return (
    <AuthShell title="Sign in" subtitle="Welcome back — access your orders, wishlist, and gift history.">
      <Suspense>
        <AuthError />
      </Suspense>
      <SocialAuthButtons next={next} />
      <div className="mt-5">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </AuthShell>
  )
}
