'use server'

import { checkRateLimit } from '@/lib/utils/rate-limit'
import { headers } from 'next/headers'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function sendContactMessage(
  name: string,
  email: string,
  phone: string,
  subject: string,
  message: string,
  honeypot: string
): Promise<{ success: boolean; error?: string }> {
  // Honeypot check (bot trap)
  if (honeypot.trim() !== '') {
    return { success: true } // silently succeed to fool bots
  }

  // Rate limit: 3 per minute per IP
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  if (!checkRateLimit(`contact:${ip}`, 3, 60_000)) {
    return { success: false, error: 'Too many requests. Please wait a minute and try again.' }
  }

  // Validate
  if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
    return { success: false, error: 'Please fill in all required fields.' }
  }
  if (!isValidEmail(email.trim())) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  // MOCK_MODE — accept and short-circuit without logging PII
  if (process.env.MOCK_MODE === 'true') {
    return { success: true }
  }

  const WP_BASE = (process.env.WP_GRAPHQL_URL ?? '').replace(/\/graphql\/?$/, '')
  if (!WP_BASE) {
    // No WP configured — log and return success to avoid exposing config issues
    console.error('[contact] WP_GRAPHQL_URL not set')
    return { success: true }
  }

  try {
    const res = await fetch(`${WP_BASE}/wp-json/mygift/v1/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, subject, message }),
      next: { revalidate: 0 },
    })
    if (!res.ok) throw new Error(`Contact POST ${res.status}`)
    return { success: true }
  } catch {
    return {
      success: false,
      error: 'We could not send your message right now. Please try WhatsApp or email directly.',
    }
  }
}
