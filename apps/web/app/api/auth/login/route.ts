import { NextRequest, NextResponse } from 'next/server'
import { setAuthCookie } from '@/lib/auth/server'
import type { AuthUser } from '@/lib/auth/server'
import { checkRateLimit } from '@/lib/utils/rate-limit'

const MOCK_MODE = process.env.MOCK_MODE === 'true'
const WP_GRAPHQL_URL = process.env.WP_GRAPHQL_URL

const LOGIN_MUTATION = `
  mutation Login($username: String!, $password: String!) {
    login(input: { username: $username, password: $password }) {
      authToken
      user {
        databaseId
        email
        firstName
        lastName
        roles { nodes { name } }
      }
    }
  }
`

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (!checkRateLimit(`login:${ip}`, 5, 60_000)) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again in a minute.' },
      { status: 429 }
    )
  }

  let body: { username?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { username, password } = body
  if (!username || !password) {
    return NextResponse.json({ error: 'username and password are required' }, { status: 400 })
  }

  if (MOCK_MODE) {
    const user: AuthUser = {
      id: 1,
      email: username.includes('@') ? username : `${username}@example.com`,
      firstName: 'Test',
      lastName: 'User',
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
      body: JSON.stringify({ query: LOGIN_MUTATION, variables: { username, password } }),
      cache: 'no-store',
    })

    const json = await res.json()

    if (json.errors?.length) {
      const msg: string = json.errors[0]?.message ?? 'Login failed'
      // Sanitize WP error messages (they can expose internal details)
      if (msg.toLowerCase().includes('incorrect password') || msg.toLowerCase().includes('invalid username')) {
        return NextResponse.json({ error: 'Incorrect email or password' }, { status: 401 })
      }
      return NextResponse.json({ error: 'Login failed' }, { status: 401 })
    }

    const loginData = json.data?.login
    if (!loginData?.authToken || !loginData?.user) {
      return NextResponse.json({ error: 'Login failed' }, { status: 401 })
    }

    const wp = loginData.user
    const roleNames: string[] = wp.roles?.nodes?.map((r: { name: string }) => r.name) ?? []
    const role: AuthUser['role'] = roleNames.includes('administrator') ? 'administrator' : 'customer'

    const user: AuthUser = {
      id: wp.databaseId,
      email: wp.email,
      firstName: wp.firstName ?? '',
      lastName: wp.lastName ?? '',
      role,
      wpToken: loginData.authToken,
    }

    await setAuthCookie(user)
    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } })
  } catch {
    return NextResponse.json({ error: 'Auth service unavailable' }, { status: 503 })
  }
}
