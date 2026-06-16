'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Eye, EyeOff } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('next') ?? searchParams.get('redirect') ?? '/account'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.trim(), password }),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error ?? 'Login failed')
          return
        }

        router.push(redirect.startsWith('/account') ? redirect : '/account')
        router.refresh()
      } catch {
        setError('Something went wrong. Please try again.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        label="Email or username"
        type="text"
        autoComplete="username email"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        disabled={isPending}
      />

      <div className="relative">
        <Input
          label="Password"
          type={showPw ? 'text' : 'password'}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isPending}
        />
        <button
          type="button"
          onClick={() => setShowPw((v) => !v)}
          className="absolute right-3 bottom-3 text-stone hover:text-ink transition-colors"
          aria-label={showPw ? 'Hide password' : 'Show password'}
        >
          {showPw ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
        </button>
      </div>

      <div className="flex justify-end -mt-1">
        <Link
          href="/account/forgot-password"
          className="font-body text-sm text-wine hover:text-wine-deep hover:underline underline-offset-2 transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      {error && (
        <p role="alert" className="font-body text-sm text-wine">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" loading={isPending}>
        Sign in
      </Button>

      <p className="font-body text-sm text-stone text-center">
        No account?{' '}
        <Link href="/account/register" className="text-wine underline underline-offset-2">
          Create one
        </Link>
      </p>
    </form>
  )
}
