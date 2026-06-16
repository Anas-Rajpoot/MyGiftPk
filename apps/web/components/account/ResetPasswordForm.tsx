'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function ResetPasswordForm() {
  const router = useRouter()
  const params = useSearchParams()
  const key = params.get('key') ?? ''
  const login = params.get('login') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [isPending, startTransition] = useTransition()

  const linkValid = Boolean(key && login)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, login, password }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(data.error ?? 'Something went wrong. Please try again.')
          return
        }
        setDone(true)
        setTimeout(() => router.push('/account/login'), 2200)
      } catch {
        setError('Something went wrong. Please try again.')
      }
    })
  }

  if (!linkValid) {
    return (
      <div className="text-center">
        <p className="font-body text-sm text-stone leading-relaxed">
          This reset link is incomplete or invalid. Please request a new one.
        </p>
        <Link
          href="/account/forgot-password"
          className="inline-flex items-center justify-center w-full h-12 mt-5 rounded-input bg-wine text-ivory font-body font-semibold text-[15px] hover:bg-wine-deep transition-colors"
        >
          Request a new link
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-full bg-success-tint mb-4">
          <CheckCircle2 className="h-6 w-6 text-success" aria-hidden />
        </div>
        <h2 className="font-display text-xl uppercase tracking-wide text-ink mb-2">Password updated</h2>
        <p className="font-body text-sm text-stone">Redirecting you to sign in…</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="relative">
        <Input
          label="New password"
          type={showPw ? 'text' : 'password'}
          autoComplete="new-password"
          hint="Minimum 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isPending}
        />
        <button
          type="button"
          onClick={() => setShowPw((v) => !v)}
          className="absolute right-3 top-[42px] text-stone hover:text-ink transition-colors"
          aria-label={showPw ? 'Hide password' : 'Show password'}
        >
          {showPw ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
        </button>
      </div>

      <Input
        label="Confirm new password"
        type={showPw ? 'text' : 'password'}
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        disabled={isPending}
      />

      {error && (
        <p role="alert" className="font-body text-sm text-wine">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" loading={isPending}>
        Update password
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
