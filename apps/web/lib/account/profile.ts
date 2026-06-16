/* Profile field validation + sanitization — shared by the profile API route.
   Server-only logic, but pure (no imports) so it can be unit-reasoned about. */

import type { Address } from '@/lib/auth/server'

const ADDRESS_KEYS: (keyof Address)[] = [
  'first_name', 'last_name', 'phone', 'address_1', 'address_2',
  'city', 'state', 'postcode', 'country',
]

/** Strip control chars / tags, collapse whitespace, cap length. */
export function cleanText(input: unknown, maxLen = 100): string {
  if (typeof input !== 'string') return ''
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[\x00-\x1F\x7F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen)
}

/** Normalize a WhatsApp/phone number to digits with optional leading +. */
export function cleanPhone(input: unknown): string {
  if (typeof input !== 'string') return ''
  const trimmed = input.trim()
  const plus = trimmed.startsWith('+') ? '+' : ''
  return plus + trimmed.replace(/\D/g, '').slice(0, 15)
}

/** WhatsApp must be 10–15 digits (with optional +). Empty is allowed. */
export function isValidWhatsApp(value: string): boolean {
  if (!value) return true
  return /^\+?\d{10,15}$/.test(value)
}

/** Sanitize an arbitrary address-shaped object into a clean Address. */
export function cleanAddress(input: unknown): Address {
  const src = (input ?? {}) as Record<string, unknown>
  const out: Address = {}
  for (const key of ADDRESS_KEYS) {
    const max = key === 'address_1' || key === 'address_2' ? 120 : 60
    const value = key === 'phone' ? cleanPhone(src[key]) : cleanText(src[key], max)
    if (value) out[key] = value
  }
  return out
}

export function isEmptyAddress(a: Address): boolean {
  return Object.values(a).every((v) => !v)
}
