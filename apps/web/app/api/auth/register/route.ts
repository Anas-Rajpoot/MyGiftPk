import { NextRequest, NextResponse } from 'next/server'
import { setAuthCookie } from '@/lib/auth/server'
import type { AuthUser } from '@/lib/auth/server'
import { checkRateLimit } from '@/lib/utils/rate-limit'

const MOCK_MODE = process.env.MOCK_MODE === 'true'
const WP_GRAPHQL_URL = process.env.WP_GRAPHQL_URL

const REGISTER_MUTATION = `
  mutation Register($email: String!, $password: String!, $firstName: String!, $lastName: String!) {
    registerCustomer(input: {
      email: $email
      password: $password
      firstName: $firstName
      lastName: $lastName
      username: $email
    }) {
      customer {
        databaseId
        email
        firstName
        lastName
      }
    }
  }
`

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (!checkRateLimit(`register:${ip}`, 3, 60_000)) {
    return NextResponse.json(
      { error: 'Too many registration attempts. Please try again in a minute.' },
      { status: 429 }
    )
  }

  let body: { email?: string; password?: string; firstName?: string; lastName?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { email, password, firstName = '', lastName = '' } = body

  if (!email || !password) {
    return NextResponse.json({ error: 'email and password are required' }, { status: 400 })
  }

  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  if (MOCK_MODE) {
    const user: AuthUser = {
      id: Date.now(),
      email,
      firstName: firstName || 'New',
      lastName: lastName || 'User',
      role: 'customer',
    }
    await setAuthCookie(user)
    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } })
  }

  if (!WP_GRAPHQL_URL) {
    return NextResponse.json({ error: 'Auth service not configured' }, { status: 503 })
  }

  try {
    const res = await fetch(WP_GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: REGISTER_MUTATION, variables: { email, password, firstName, lastName } }),
      cache: 'no-store',
    })

    const json = await res.json()

    if (json.errors?.length) {
      const msg: string = json.errors[0]?.message ?? ''
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('email already')) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Registration failed' }, { status: 400 })
    }

    const customer = json.data?.registerCustomer?.customer
    if (!customer) {
      return NextResponse.json({ error: 'Registration failed' }, { status: 400 })
    }

    const user: AuthUser = {
      id: customer.databaseId,
      email: customer.email,
      firstName: customer.firstName ?? firstName,
      lastName: customer.lastName ?? lastName,
      role: 'customer',
    }

    await setAuthCookie(user)
    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } })
  } catch {
    return NextResponse.json({ error: 'Auth service unavailable' }, { status: 503 })
  }
}
