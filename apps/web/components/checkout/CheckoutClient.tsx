'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, ChevronUp, Lock, Truck, Building2, X, Tag, Loader2 } from 'lucide-react'
import { clsx } from 'clsx'
import { useCartStore } from '@/lib/stores/cart'
import { fetchCart, removeItem, applyCoupon, removeCoupon } from '@/lib/cart/client'
import { PK_PROVINCES, PAYMENT_METHODS, type PaymentMethodId } from '@/lib/woo/checkout'
import type { CartData } from '@/lib/cart/normalize'

/* ── Form state ────────────────────────────────── */

interface AddressFields {
  first_name: string
  last_name: string
  email: string
  phone: string
  address_1: string
  address_2: string
  city: string
  state: string
  postcode: string
  country: string
}

const EMPTY_ADDRESS: AddressFields = {
  first_name: '', last_name: '', email: '', phone: '',
  address_1: '', address_2: '', city: '', state: '',
  postcode: '', country: 'PK',
}

/* ── Field component ───────────────────────────── */

function Field({
  label, name, type = 'text', value, onChange, error, required, placeholder, className,
}: {
  label: string
  name: string
  type?: string
  value: string
  onChange: (v: string) => void
  error?: string
  required?: boolean
  placeholder?: string
  className?: string
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="block font-body text-sm font-medium text-ink mb-1.5">
        {label}{required && <span className="text-wine ml-0.5" aria-hidden>*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={name}
        className={clsx(
          'w-full h-12 px-4 rounded-input border bg-ivory font-body text-sm text-ink',
          'placeholder:text-stone/60 transition-colors',
          'focus:outline-none focus:border-wine focus:ring-2 focus:ring-wine/20',
          error ? 'border-wine' : 'border-hairline hover:border-stone'
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-err` : undefined}
      />
      {error && (
        <p id={`${name}-err`} role="alert" className="mt-1 font-body text-xs text-wine">
          {error}
        </p>
      )}
    </div>
  )
}

function SelectField({
  label, name, value, onChange, options, error, required, placeholder,
}: {
  label: string
  name: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  error?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <div>
      <label htmlFor={name} className="block font-body text-sm font-medium text-ink mb-1.5">
        {label}{required && <span className="text-wine ml-0.5" aria-hidden>*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(
          'w-full h-12 px-4 rounded-input border bg-ivory font-body text-sm text-ink',
          'transition-colors appearance-none',
          'focus:outline-none focus:border-wine focus:ring-2 focus:ring-wine/20',
          error ? 'border-wine' : 'border-hairline hover:border-stone'
        )}
        aria-invalid={!!error}
      >
        <option value="">{placeholder ?? 'Select…'}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p role="alert" className="mt-1 font-body text-xs text-wine">{error}</p>}
    </div>
  )
}

/* ── Section wrapper ───────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-ivory rounded-card border border-hairline p-6">
      <h2 className="font-body text-base font-semibold text-ink mb-5">{title}</h2>
      {children}
    </div>
  )
}

/* ── Main component ────────────────────────────── */

export function CheckoutClient() {
  const router = useRouter()
  const cart = useCartStore((s) => s.cart)
  const setCart = useCartStore((s) => s.setCart)

  // Load cart if not yet in store
  useEffect(() => {
    if (!cart) fetchCart().then(setCart).catch(() => null)
  }, [cart, setCart])

  const [billing, setBilling] = useState<AddressFields>(EMPTY_ADDRESS)
  const [shippingSame] = useState(true)
  const [shipping] = useState<AddressFields>(EMPTY_ADDRESS)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('cod')
  const [customerNote, setCustomerNote] = useState('')
  const [summaryOpen, setSummaryOpen] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof AddressFields | 'payment', string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [authed, setAuthed] = useState<boolean | null>(null)

  // Detect login + prefill saved address (never blocks — guests skip this entirely)
  useEffect(() => {
    let active = true
    fetch('/api/account/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!active) return
        if (!d?.user) { setAuthed(false); return }
        setAuthed(true)
        const b = d.user.billing ?? {}
        setBilling((prev) => ({
          first_name: prev.first_name || b.first_name || d.user.firstName || '',
          last_name: prev.last_name || b.last_name || d.user.lastName || '',
          email: prev.email || d.user.email || '',
          phone: prev.phone || b.phone || d.user.whatsapp || '',
          address_1: prev.address_1 || b.address_1 || '',
          address_2: prev.address_2 || b.address_2 || '',
          city: prev.city || b.city || '',
          state: prev.state || b.state || '',
          postcode: prev.postcode || b.postcode || '',
          country: b.country || prev.country || 'PK',
        }))
      })
      .catch(() => { if (active) setAuthed(false) })
    return () => { active = false }
  }, [])

  function updateBilling(key: keyof AddressFields, value: string) {
    setBilling((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  // ── Order summary edits (remove item / coupons) ──
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState<string | null>(null)
  const [couponPending, setCouponPending] = useState(false)

  async function handleRemoveItem(key: string) {
    setBusyKey(key)
    try {
      setCart(await removeItem(key))
    } catch {
      /* leave cart as-is */
    } finally {
      setBusyKey(null)
    }
  }

  async function handleApplyCoupon() {
    const code = couponCode.trim()
    if (!code) return
    setCouponPending(true)
    setCouponError(null)
    try {
      setCart(await applyCoupon(code))
      setCouponCode('')
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : 'This code can’t be applied.')
    } finally {
      setCouponPending(false)
    }
  }

  async function handleRemoveCoupon(code: string) {
    setCouponPending(true)
    try {
      setCart(await removeCoupon(code))
    } catch {
      /* ignore */
    } finally {
      setCouponPending(false)
    }
  }

  const summaryHandlers = {
    onRemoveItem: handleRemoveItem,
    busyKey,
    couponCode,
    setCouponCode,
    onApplyCoupon: handleApplyCoupon,
    onRemoveCoupon: handleRemoveCoupon,
    couponError,
    couponPending,
  }

  function validate(): boolean {
    const errs: typeof errors = {}
    const required: (keyof AddressFields)[] = [
      'first_name', 'last_name', 'email', 'phone',
      'address_1', 'city', 'state', 'country',
    ]
    for (const k of required) {
      if (!billing[k]?.trim()) errs[k] = 'This field is required'
    }
    if (billing.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billing.email)) {
      errs.email = 'Enter a valid email address'
    }
    if (billing.phone && !/^\+?[\d\s\-()]{9,15}$/.test(billing.phone)) {
      errs.phone = 'Enter a valid phone number'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setServerError(null)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billing,
          shipping_same: shippingSame,
          shipping: shippingSame ? undefined : shipping,
          payment_method: paymentMethod,
          customer_note: customerNote,
          items: (cart?.items ?? []).map((i) => ({
            productId: i.productId,
            variationId: i.variationId,
            quantity: i.quantity,
          })),
          coupons: (cart?.discounts ?? []).map((d) => d.code),
        }),
      })

      const data = await res.json() as {
        order_id?: number
        order_number?: string
        order_key?: string
        order_status?: string
        payment_redirect?: string | null
        error?: string
      }

      if (!res.ok) {
        setServerError(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      // Clear cart in Zustand store
      setCart({
        items: [], subtotal: 'Rs. 0', total: 'Rs. 0', itemCount: 0,
        discounts: [], freeShippingThreshold: 3000, freeShippingRemaining: 3000,
        giftWrapEnabled: false, giftWrapCost: 'Rs. 150',
      })

      // Only follow a redirect for true external payment gateways.
      // COD/bank transfer return WooCommerce's own "order-received" page —
      // we ignore that and show our branded confirmation instead.
      const redirect = data.payment_redirect
      const isExternalGateway = !!redirect && !/order-received/i.test(redirect)
      if (isExternalGateway) {
        window.location.href = redirect!
        return
      }

      router.push(`/order-confirmation?id=${data.order_id}&num=${encodeURIComponent(data.order_number ?? '')}&method=${paymentMethod}`)
    } catch {
      setServerError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const isEmpty = !cart || cart.items.length === 0

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* Header */}
        <div className="mb-8">
          <Link href="/cart" className="font-body text-sm text-stone hover:text-wine transition-colors">
            ← Back to cart
          </Link>
          <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-wide text-ink mt-3">
            Checkout
          </h1>
        </div>

        {isEmpty ? (
          <div className="text-center py-20">
            <p className="font-body text-stone mb-4">Your cart is empty.</p>
            <Link href="/shop" className="font-body text-sm text-wine hover:text-wine-deep underline underline-offset-2">
              Continue shopping
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {/* Optional sign-in nudge — guest checkout stays the default path below */}
            {authed === false && (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-2 px-4 py-3 rounded-card border border-hairline bg-ivory">
                <p className="font-body text-sm text-stone">
                  Checking out as a guest. Have an account?
                </p>
                <Link
                  href="/account/login?next=/checkout"
                  className="font-body text-sm font-semibold text-wine hover:text-wine-deep transition-colors"
                >
                  Sign in for faster checkout →
                </Link>
              </div>
            )}

            <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-10 xl:gap-14">

              {/* ── LEFT COLUMN ─────────────────────── */}
              <div className="space-y-5">

                {/* Mobile order summary toggle */}
                <button
                  type="button"
                  onClick={() => setSummaryOpen((o) => !o)}
                  className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-ivory border border-hairline rounded-card"
                >
                  <span className="font-body text-sm font-medium text-ink">
                    {summaryOpen ? 'Hide' : 'Show'} order summary
                    <span className="ml-2 text-stone">({cart?.itemCount} items)</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-body text-sm font-semibold text-ink tabular-nums">
                      {cart?.total}
                    </span>
                    {summaryOpen ? <ChevronUp className="h-4 w-4 text-stone" /> : <ChevronDown className="h-4 w-4 text-stone" />}
                  </div>
                </button>

                {/* Mobile summary (collapsible) */}
                {summaryOpen && (
                  <div className="lg:hidden">
                    <OrderSummaryContent cart={cart} {...summaryHandlers} />
                  </div>
                )}

                {/* 1. Contact */}
                <Section title="Contact Details">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="First name" name="first_name" value={billing.first_name}
                      onChange={(v) => updateBilling('first_name', v)} error={errors.first_name} required />
                    <Field label="Last name" name="last_name" value={billing.last_name}
                      onChange={(v) => updateBilling('last_name', v)} error={errors.last_name} required />
                    <Field label="Email address" name="email" type="email" value={billing.email}
                      onChange={(v) => updateBilling('email', v)} error={errors.email} required
                      placeholder="you@example.com" className="sm:col-span-2" />
                    <Field label="Phone / WhatsApp" name="phone" type="tel" value={billing.phone}
                      onChange={(v) => updateBilling('phone', v)} error={errors.phone} required
                      placeholder="03001234567" className="sm:col-span-2" />
                  </div>
                </Section>

                {/* 2. Delivery address */}
                <Section title="Delivery Address">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Address line 1" name="address_1" value={billing.address_1}
                      onChange={(v) => updateBilling('address_1', v)} error={errors.address_1} required
                      placeholder="House / Flat no., Street" className="sm:col-span-2" />
                    <Field label="Address line 2" name="address_2" value={billing.address_2}
                      onChange={(v) => updateBilling('address_2', v)}
                      placeholder="Area, Block, Near landmark" className="sm:col-span-2" />
                    <Field label="City" name="city" value={billing.city}
                      onChange={(v) => updateBilling('city', v)} error={errors.city} required />
                    <SelectField
                      label="Province" name="state" value={billing.state}
                      onChange={(v) => updateBilling('state', v)} error={errors.state} required
                      placeholder="Select province"
                      options={PK_PROVINCES.map((p) => ({ value: p.code, label: p.label }))}
                    />
                    <Field label="Postcode" name="postcode" value={billing.postcode}
                      onChange={(v) => updateBilling('postcode', v)} placeholder="Optional" />
                    <SelectField
                      label="Country" name="country" value={billing.country}
                      onChange={(v) => updateBilling('country', v)} error={errors.country} required
                      options={[
                        { value: 'PK', label: 'Pakistan' },
                        { value: 'GB', label: 'United Kingdom' },
                        { value: 'US', label: 'United States' },
                        { value: 'CA', label: 'Canada' },
                        { value: 'AU', label: 'Australia' },
                        { value: 'AE', label: 'UAE' },
                        { value: 'SA', label: 'Saudi Arabia' },
                      ]}
                    />
                  </div>
                </Section>

                {/* 3. Payment method */}
                <Section title="Payment Method">
                  <div className="space-y-3">
                    {PAYMENT_METHODS.map((m) => (
                      <label
                        key={m.id}
                        className={clsx(
                          'flex items-start gap-4 p-4 rounded-input border cursor-pointer transition-colors',
                          paymentMethod === m.id
                            ? 'border-wine bg-wine-tint'
                            : 'border-hairline hover:border-stone bg-ivory'
                        )}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          value={m.id}
                          checked={paymentMethod === m.id}
                          onChange={() => setPaymentMethod(m.id as PaymentMethodId)}
                          className="mt-0.5 accent-wine"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {m.id === 'cod' ? (
                              <Truck className="h-4 w-4 text-wine shrink-0" aria-hidden />
                            ) : (
                              <Building2 className="h-4 w-4 text-wine shrink-0" aria-hidden />
                            )}
                            <span className="font-body text-sm font-semibold text-ink">{m.label}</span>
                          </div>
                          <p className="font-body text-xs text-stone mt-0.5">{m.description}</p>
                          {m.id === 'bacs' && paymentMethod === 'bacs' && (
                            <div className="mt-3 p-3 bg-cream rounded border border-hairline font-body text-xs text-stone space-y-1">
                              <p className="font-medium text-ink">Bank Account Details</p>
                              <p>Bank: HBL · Account: 0123-4567890-01 · Title: MYGIFT (Pvt) Ltd</p>
                              <p className="text-wine">Include your order number in the transfer reference.</p>
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </Section>

                {/* 4. Order note */}
                <Section title="Order Notes (optional)">
                  <label htmlFor="customer_note" className="block font-body text-sm font-medium text-ink mb-1.5">
                    Special instructions or delivery note
                  </label>
                  <textarea
                    id="customer_note"
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    rows={3}
                    placeholder="Any notes about your order, e.g. delivery time preference…"
                    className="w-full px-4 py-3 rounded-input border border-hairline bg-ivory font-body text-sm text-ink placeholder:text-stone/60 resize-none focus:outline-none focus:border-wine focus:ring-2 focus:ring-wine/20 transition-colors"
                  />
                </Section>

                {/* Server error */}
                {serverError && (
                  <div role="alert" className="flex items-start gap-3 p-4 bg-wine-tint border border-wine/30 rounded-input">
                    <span className="text-wine font-body text-sm">{serverError}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting || isEmpty}
                  aria-busy={submitting}
                  className={clsx(
                    'w-full h-14 rounded-input font-body font-semibold text-[15px] tracking-wide',
                    'flex items-center justify-center gap-3 transition-colors',
                    submitting || isEmpty
                      ? 'bg-hairline text-stone cursor-not-allowed'
                      : 'bg-wine hover:bg-wine-deep text-ivory'
                  )}
                >
                  {submitting ? (
                    <>
                      <span className="h-5 w-5 border-2 border-stone border-t-transparent rounded-full animate-spin" aria-hidden />
                      Placing order…
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" aria-hidden />
                      Place Order · {cart?.total}
                    </>
                  )}
                </button>

                <p className="font-body text-xs text-stone text-center">
                  By placing your order you agree to our{' '}
                  <Link href="/terms" className="text-wine hover:underline">Terms & Conditions</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-wine hover:underline">Privacy Policy</Link>.
                </p>
              </div>

              {/* ── RIGHT COLUMN (desktop) ──────────── */}
              <div className="hidden lg:block">
                <div className="sticky top-6">
                  <OrderSummaryContent cart={cart} {...summaryHandlers} />
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

/* ── Order Summary (shared mobile / desktop) ────── */

interface SummaryProps {
  cart: CartData | null
  onRemoveItem: (key: string) => void
  busyKey: string | null
  couponCode: string
  setCouponCode: (v: string) => void
  onApplyCoupon: () => void
  onRemoveCoupon: (code: string) => void
  couponError: string | null
  couponPending: boolean
}

function OrderSummaryContent({
  cart, onRemoveItem, busyKey,
  couponCode, setCouponCode, onApplyCoupon, onRemoveCoupon, couponError, couponPending,
}: SummaryProps) {
  if (!cart) return null
  return (
    <div className="bg-ivory rounded-card border border-hairline overflow-hidden">
      <div className="px-5 py-4 border-b border-hairline">
        <h3 className="font-body text-sm font-semibold text-ink">
          Order Summary
          <span className="ml-2 font-normal text-stone">({cart.itemCount} items)</span>
        </h3>
      </div>

      {/* Items */}
      <ul className="divide-y divide-hairline">
        {cart.items.map((item) => (
          <li key={item.key} className="flex gap-3 px-5 py-4">
            <div className="relative w-14 h-[72px] rounded border border-hairline bg-cream shrink-0 overflow-hidden">
              {item.image ? (
                <Image
                  src={item.image.sourceUrl}
                  alt={item.image.altText || item.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-wine-tint" />
              )}
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-wine text-ivory text-[10px] font-body font-semibold rounded-full flex items-center justify-center">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body text-sm font-medium text-ink line-clamp-2 leading-snug">
                {item.name}
              </p>
              {item.variationLabel && (
                <p className="font-body text-xs text-stone mt-0.5">{item.variationLabel}</p>
              )}
              <p className="font-body text-sm font-semibold text-ink mt-1 tabular-nums">
                {item.lineTotal}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRemoveItem(item.key)}
              disabled={busyKey === item.key}
              aria-label={`Remove ${item.name}`}
              className="self-start -mr-1 flex items-center justify-center w-7 h-7 rounded-full text-stone hover:text-wine hover:bg-wine-tint transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine"
            >
              {busyKey === item.key
                ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                : <X className="h-4 w-4" aria-hidden />}
            </button>
          </li>
        ))}
      </ul>

      {/* Coupon */}
      <div className="px-5 py-4 border-t border-hairline">
        <label htmlFor="coupon" className="flex items-center gap-1.5 font-body text-xs font-medium text-stone mb-2">
          <Tag className="h-3.5 w-3.5" aria-hidden />
          Discount code
        </label>
        <div className="flex gap-2">
          <input
            id="coupon"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onApplyCoupon() } }}
            placeholder="Enter code"
            autoComplete="off"
            className="flex-1 h-11 px-3.5 rounded-input border border-hairline bg-ivory font-body text-sm text-ink placeholder:text-stone/60 uppercase tracking-wide focus:outline-none focus:border-wine focus:ring-2 focus:ring-wine/20 transition-colors"
          />
          <button
            type="button"
            onClick={onApplyCoupon}
            disabled={couponPending || !couponCode.trim()}
            className="h-11 px-4 rounded-input border border-wine text-wine font-body text-sm font-semibold hover:bg-wine-tint transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {couponPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : 'Apply'}
          </button>
        </div>
        {couponError && (
          <p role="alert" className="mt-2 font-body text-xs text-wine">{couponError}</p>
        )}
      </div>

      {/* Totals */}
      <div className="px-5 py-4 border-t border-hairline space-y-2">
        {cart.discounts.length > 0 && cart.discounts.map((d) => (
          <div key={d.code} className="flex justify-between items-center font-body text-sm">
            <span className="flex items-center gap-1.5 text-stone">
              Discount ({d.code})
              <button
                type="button"
                onClick={() => onRemoveCoupon(d.code)}
                disabled={couponPending}
                aria-label={`Remove discount ${d.code}`}
                className="text-stone hover:text-wine transition-colors disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </span>
            <span className="text-wine tabular-nums">−{d.amount}</span>
          </div>
        ))}
        <div className="flex justify-between font-body text-sm">
          <span className="text-stone">Subtotal</span>
          <span className="text-ink tabular-nums">{cart.subtotal}</span>
        </div>
        <div className="flex justify-between font-body text-sm">
          <span className="text-stone">Shipping</span>
          <span className={cart.freeShippingRemaining <= 0 ? 'text-wine font-medium' : 'text-ink tabular-nums'}>
            {cart.freeShippingRemaining <= 0 ? 'Free' : 'Calculated at next step'}
          </span>
        </div>
        <div className="flex justify-between font-body text-base font-semibold border-t border-hairline pt-2">
          <span className="text-ink">Total</span>
          <span className="text-ink tabular-nums">{cart.total}</span>
        </div>
      </div>

      {/* Secure badge */}
      <div className="px-5 py-3 border-t border-hairline flex items-center gap-2">
        <Lock className="h-3.5 w-3.5 text-stone shrink-0" aria-hidden />
        <p className="font-body text-xs text-stone">
          Secure checkout — your information is encrypted
        </p>
      </div>
    </div>
  )
}
