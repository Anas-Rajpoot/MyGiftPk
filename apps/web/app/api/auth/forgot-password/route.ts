import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { validateOrigin } from '@/lib/utils/csrf'

const MOCK_MODE = process.env.MOCK_MODE === 'true'
const WP_GRAPHQL_URL = process.env.WP_GRAPHQL_URL

const SEND_RESET = `
  mutation SendReset($username: String!) {
    sendPasswordResetEmail(input: { username: $username }) {
      success
    }
  }
`

export async function POST(req: NextRequest) {
  if (!validateOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (!checkRateLimit(`forgot:${ip}`, 5, 60_000)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 }
    )
  }

  let body: { email?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const email = body.email?.trim()
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  // Always respond with success — never reveal whether an account exists.
  const ok = NextResponse.json({ ok: true })

  if (MOCK_MODE || !WP_GRAPHQL_URL) {
    return ok
  }

  try {
    await fetch(WP_GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: SEND_RESET, variables: { username: email } }),
      cache: 'no-store',
    })
  } catch {
    // Swallow — still return generic success to avoid account enumeration
  }

  return ok
}
