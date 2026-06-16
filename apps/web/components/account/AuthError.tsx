'use client'

import { useSearchParams } from 'next/navigation'
import { AlertCircle } from 'lucide-react'

const MESSAGES: Record<string, string> = {
  oauth_unavailable: 'Social login isn’t configured yet. Please sign in with your email and password.',
  oauth_unknown: 'Unknown sign-in provider.',
  oauth_cancelled: 'Sign-in was cancelled.',
  oauth_failed: 'Social sign-in failed. Please try again.',
  oauth_no_email: 'We couldn’t get an email address from that account. Try another method.',
  oauth_account: 'We couldn’t set up your account. Please try again or use email.',
}

export function AuthError() {
  const code = useSearchParams().get('error')
  if (!code) return null
  const message = MESSAGES[code] ?? 'Something went wrong. Please try again.'

  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 mb-5 px-4 py-3 rounded-input bg-wine-tint border border-wine/20"
    >
      <AlertCircle className="h-4 w-4 text-wine shrink-0 mt-0.5" aria-hidden />
      <p className="font-body text-sm text-wine">{message}</p>
    </div>
  )
}
