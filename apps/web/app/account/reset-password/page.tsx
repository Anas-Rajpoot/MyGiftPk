import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getAuthUser } from '@/lib/auth/server'
import { AuthShell } from '@/components/account/AuthShell'
import { ResetPasswordForm } from '@/components/account/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Set New Password',
  robots: { index: false, follow: false },
}

export default async function ResetPasswordPage() {
  const user = await getAuthUser()
  if (user) redirect('/account')

  return (
    <AuthShell
      title="New password"
      subtitle="Choose a new password for your MYGIFT account."
    >
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  )
}
