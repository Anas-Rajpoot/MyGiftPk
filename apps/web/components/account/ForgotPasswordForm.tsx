'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { MailCheck, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const value = email.trim()
    if (!value) {
      setError('Please enter your email address.')
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: value }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setError(data.error ?? 'Something went wrong. Please try again.')
          return
        }
        setSent(true)
      } catch {
        setError('Something went wrong. Please try again.')
      }
    })
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-full bg-wine-tint mb-4">
          <MailCheck className="h-6 w-6 text-wine" aria-hidden />
        </div>
        <h2 className="font-display text-xl uppercase tracking-wide text-ink mb-2">Check your email</h2>
        <p className="font-body text-sm text-stone leading-relaxed">
          If an account exists for <span className="text-ink font-medium">{email.trim()}</span>, we’ve
          sent a link to reset your password. It may take a few minutes to arrive.
        </p>
        <Link
          href="/account/login"
          className="inline-flex items-center gap-1.5 mt-6 font-body text-sm text-wine hover:text-wine-deep transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={isPending}
      />

      {error && (
        <p role="alert" className="font-body text-sm text-wine">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" loading={isPending}>
        Send reset link
      </Button>

      <Link
        href="/account/login"
        className="flex items-center justify-center gap-1.5 font-body text-sm text-stone hover:text-wine transition-colors"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to sign in
      </Link>
    </form>
  )
}
