'use client'

import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { sendContactMessage } from '@/app/contact/actions'
import { clsx } from 'clsx'

const SUBJECT_OPTIONS = [
  { value: '', label: 'Select a subject' },
  { value: 'order-issue', label: 'Order Issue' },
  { value: 'gift-inquiry', label: 'Gift Inquiry' },
  { value: 'wholesale', label: 'Wholesale' },
  { value: 'other', label: 'Other' },
]

export function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!subject) {
      setError('Please select a subject.')
      return
    }

    startTransition(async () => {
      const result = await sendContactMessage(name, email, phone, subject, message, honeypot)
      if (result.success) {
        setSubmitted(true)
      } else {
        setError(result.error ?? 'Something went wrong. Please try again.')
      }
    })
  }

  if (submitted) {
    return (
      <div className="rounded-card border border-hairline bg-ivory p-8 text-center space-y-3">
        {/* Ribbon flourish */}
        <svg aria-hidden viewBox="0 0 120 12" height={12} className="mx-auto mb-1" style={{ display: 'block', width: 120 }}>
          <line x1="0" y1="6" x2="104" y2="6" stroke="var(--wine)" strokeWidth="2" strokeLinecap="round" />
          <path d="M104 6 C108 2 114 2 116 6 C114 10 108 10 104 6Z" fill="var(--wine)" />
        </svg>
        <p className="font-display text-2xl uppercase text-ink">Message Sent</p>
        <p className="font-body text-sm text-stone">
          Thank you, {name}. We will get back to you within 1 business day.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot — hidden from real users */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="absolute opacity-0 pointer-events-none h-0 w-0 overflow-hidden"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isPending}
        />
        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isPending}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Phone (optional)"
          type="tel"
          autoComplete="tel"
          placeholder="03001234567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={isPending}
        />
        <Select
          label="Subject"
          options={SUBJECT_OPTIONS}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          disabled={isPending}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-message" className="font-body text-sm font-medium text-ink">
          Message
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          disabled={isPending}
          rows={5}
          placeholder="How can we help you?"
          className={clsx(
            'w-full rounded-input border bg-ivory px-4 py-3 font-body text-base text-ink placeholder:text-stone',
            'transition-colors duration-150 outline-none resize-vertical',
            'focus-visible:border-wine focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-1',
            'border-hairline hover:border-stone',
            isPending && 'opacity-40 cursor-not-allowed'
          )}
        />
      </div>

      {error && (
        <p role="alert" className="font-body text-sm text-wine">
          {error}
        </p>
      )}

      <Button type="submit" loading={isPending} className="w-full sm:w-auto">
        Send Message
      </Button>
    </form>
  )
}
