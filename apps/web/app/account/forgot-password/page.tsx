import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth/server'
import { AuthShell } from '@/components/account/AuthShell'
import { ForgotPasswordForm } from '@/components/account/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Reset Password',
  robots: { index: false, follow: false },
}

export default async function ForgotPasswordPage() {
  const user = await getAuthUser()
  if (user) redirect('/account')

  return (
    <AuthShell
      title="Reset password"
      subtitle="Enter your email and we’ll send you a link to set a new password."
    >
      <ForgotPasswordForm />
    </AuthShell>
  )
}
