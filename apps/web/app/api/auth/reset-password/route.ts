import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { validateOrigin } from '@/lib/utils/csrf'

const MOCK_MODE = process.env.MOCK_MODE === 'true'
const WP_GRAPHQL_URL = process.env.WP_GRAPHQL_URL

const RESET_PASSWORD = `
  mutation ResetPassword($key: String!, $login: String!, $password: String!) {
    resetUserPassword(input: { key: $key, login: $login, password: $password }) {
      user { databaseId }
    }
  }
`

export async function POST(req: NextRequest) {
  if (!validateOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (!checkRateLimit(`reset:${ip}`, 5, 60_000)) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again in a minute.' },
      { status: 429 }
    )
  }

  let body: { key?: string; login?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { key, login, password } = body
  if (!key || !login || !password) {
    return NextResponse.json({ error: 'Missing reset details. Please use the link from your email.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  if (MOCK_MODE || !WP_GRAPHQL_URL) {
    return NextResponse.json({ ok: true })
  }

  try {
    const res = await fetch(WP_GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: RESET_PASSWORD, variables: { key, login, password } }),
      cache: 'no-store',
    })
    const json = await res.json()

    if (json.errors?.length) {
      return NextResponse.json(
        { error: 'This reset link is invalid or has expired. Please request a new one.' },
        { status: 400 }
      )
    }
    if (!json.data?.resetUserPassword?.user) {
      return NextResponse.json(
        { error: 'This reset link is invalid or has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Service unavailable. Please try again.' }, { status: 503 })
  }
}
