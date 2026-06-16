'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Eye, EyeOff } from 'lucide-react'

export function RegisterForm() {
  const router = useRouter()

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.email.trim(),
            password: form.password,
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error ?? 'Registration failed')
          return
        }

        router.push('/account')
        router.refresh()
      } catch {
        setError('Something went wrong. Please try again.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="First name"
          type="text"
          autoComplete="given-name"
          value={form.firstName}
          onChange={set('firstName')}
          disabled={isPending}
        />
        <Input
          label="Last name"
          type="text"
          autoComplete="family-name"
          value={form.lastName}
          onChange={set('lastName')}
          disabled={isPending}
        />
      </div>

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        value={form.email}
        onChange={set('email')}
        required
        disabled={isPending}
      />

      <div className="relative">
        <Input
          label="Password"
          type={showPw ? 'text' : 'password'}
          autoComplete="new-password"
          hint="Minimum 8 characters"
          value={form.password}
          onChange={set('password')}
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

      {error && (
        <p role="alert" className="font-body text-sm text-wine">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" loading={isPending}>
        Create account
      </Button>

      <p className="font-body text-xs text-stone text-center leading-relaxed">
        By creating an account you agree to our{' '}
        <Link href="/terms" className="text-wine hover:underline underline-offset-2">terms</Link>
        {' '}and{' '}
        <Link href="/privacy-policy" className="text-wine hover:underline underline-offset-2">privacy policy</Link>.
      </p>

      <p className="font-body text-sm text-stone text-center">
        Already have an account?{' '}
        <Link href="/account/login" className="text-wine underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </form>
  )
}
