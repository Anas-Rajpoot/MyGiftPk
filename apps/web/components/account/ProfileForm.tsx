'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { PK_PROVINCES } from '@/lib/woo/checkout'

interface Address {
  first_name?: string
  last_name?: string
  phone?: string
  address_1?: string
  address_2?: string
  city?: string
  state?: string
  postcode?: string
  country?: string
}

interface Props {
  user: { id: number; email: string; firstName: string; lastName: string }
}

const COUNTRIES = [
  { value: 'PK', label: 'Pakistan' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'AE', label: 'UAE' },
  { value: 'SA', label: 'Saudi Arabia' },
]

const EMPTY: Address = { country: 'PK' }

function AddressFields({
  value,
  onChange,
  disabled,
}: {
  value: Address
  onChange: (next: Address) => void
  disabled?: boolean
}) {
  const set = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, [k]: e.target.value })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Input label="First name" autoComplete="given-name" value={value.first_name ?? ''} onChange={set('first_name')} disabled={disabled} />
      <Input label="Last name" autoComplete="family-name" value={value.last_name ?? ''} onChange={set('last_name')} disabled={disabled} />
      <Input label="Address line 1" autoComplete="address-line1" containerClassName="sm:col-span-2" value={value.address_1 ?? ''} onChange={set('address_1')} disabled={disabled} placeholder="House / flat no., street" />
      <Input label="Address line 2" autoComplete="address-line2" containerClassName="sm:col-span-2" value={value.address_2 ?? ''} onChange={set('address_2')} disabled={disabled} placeholder="Area, block, landmark (optional)" />
      <Input label="City" autoComplete="address-level2" value={value.city ?? ''} onChange={set('city')} disabled={disabled} />
      <Select
        label="Province"
        placeholder="Select province"
        value={value.state ?? ''}
        onChange={(e) => onChange({ ...value, state: e.target.value })}
        disabled={disabled}
        options={PK_PROVINCES.map((p) => ({ value: p.code, label: p.label }))}
      />
      <Input label="Postcode" autoComplete="postal-code" value={value.postcode ?? ''} onChange={set('postcode')} disabled={disabled} placeholder="Optional" />
      <Select
        label="Country"
        value={value.country ?? 'PK'}
        onChange={(e) => onChange({ ...value, country: e.target.value })}
        disabled={disabled}
        options={COUNTRIES}
      />
    </div>
  )
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-hairline bg-ivory p-5 sm:p-6">
      <div className="mb-4">
        <h3 className="font-body text-base font-semibold text-ink">{title}</h3>
        {description && <p className="font-body text-xs text-stone mt-0.5">{description}</p>}
      </div>
      {children}
    </section>
  )
}

export function ProfileForm({ user }: Props) {
  const router = useRouter()
  const [loaded, setLoaded] = useState(false)
  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName)
  const [whatsapp, setWhatsapp] = useState('')
  const [billing, setBilling] = useState<Address>(EMPTY)
  const [shipping, setShipping] = useState<Address>(EMPTY)
  const [sameAsBilling, setSameAsBilling] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Load full profile (whatsapp + addresses) on mount
  useEffect(() => {
    let active = true
    fetch('/api/account/profile')
      .then((r) => r.json())
      .then((d) => {
        if (!active || !d.user) return
        setFirstName(d.user.firstName ?? '')
        setLastName(d.user.lastName ?? '')
        setWhatsapp(d.user.whatsapp ?? '')
        const b: Address = d.user.billing && Object.keys(d.user.billing).length ? d.user.billing : EMPTY
        const s: Address = d.user.shipping && Object.keys(d.user.shipping).length ? d.user.shipping : EMPTY
        setBilling(b)
        setShipping(s)
        // If shipping differs from billing, show the separate section
        setSameAsBilling(JSON.stringify(s) === JSON.stringify(b) || !d.user.shipping || Object.keys(d.user.shipping).length === 0)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
    return () => { active = false }
  }, [])

  function dirtyReset() {
    setError(null)
    setSuccess(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    dirtyReset()

    // WhatsApp validation (client mirror of server rule)
    const wa = whatsapp.trim()
    if (wa && !/^\+?\d{10,15}$/.test(wa.replace(/[\s\-()]/g, ''))) {
      setError('Enter a valid WhatsApp number (10–15 digits, e.g. 03001234567).')
      return
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/account/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            whatsapp: wa,
            billing,
            shipping,
            shippingSameAsBilling: sameAsBilling,
          }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error ?? 'Could not save changes.')
          return
        }
        setSuccess(true)
        router.refresh()
      } catch {
        setError('Something went wrong. Please try again.')
      }
    })
  }

  if (!loaded) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-40 rounded-card bg-cream animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl" onChange={dirtyReset}>
      {/* Personal */}
      <Section title="Personal details" description="Your name and how we reach you.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="First name" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={isPending} />
          <Input label="Last name" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={isPending} />
          <Input label="Email" type="email" value={user.email} disabled hint="Email cannot be changed here" containerClassName="sm:col-span-2" />
          <Input
            label="WhatsApp number"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            disabled={isPending}
            placeholder="03001234567"
            hint="We’ll use this for order updates on WhatsApp."
            containerClassName="sm:col-span-2"
          />
        </div>
      </Section>

      {/* Billing */}
      <Section title="Billing address" description="Used for invoices and payment.">
        <AddressFields value={billing} onChange={setBilling} disabled={isPending} />
      </Section>

      {/* Shipping */}
      <Section title="Shipping address" description="Where your orders are delivered.">
        <label className="flex items-center gap-2.5 mb-4 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={sameAsBilling}
            onChange={(e) => setSameAsBilling(e.target.checked)}
            disabled={isPending}
            className="h-4 w-4 accent-wine"
          />
          <span className="font-body text-sm text-ink">Same as billing address</span>
        </label>
        {!sameAsBilling && (
          <AddressFields value={shipping} onChange={setShipping} disabled={isPending} />
        )}
      </Section>

      {/* Feedback + actions */}
      {error && <p role="alert" className="font-body text-sm text-wine">{error}</p>}
      {success && (
        <p className="flex items-center gap-1.5 font-body text-sm text-success">
          <CheckCircle2 className="h-4 w-4" aria-hidden />
          Profile saved
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" loading={isPending}>Save changes</Button>
      </div>
    </form>
  )
}
