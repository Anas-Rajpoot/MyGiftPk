/* Auth helpers — server-only. Never import from client components. */

import { cookies } from 'next/headers'
import crypto from 'crypto'

const COOKIE_NAME = 'mygift-auth'
const THIRTY_DAYS = 60 * 60 * 24 * 30

function getSecret(): string {
  const s = process.env.JWT_SECRET
  if (!s) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET env var must be set in production')
    }
    return 'dev-secret-change-in-production'
  }
  return s
}

export interface Address {
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

export interface AuthUser {
  id: number
  email: string
  firstName: string
  lastName: string
  role: 'customer' | 'administrator'
  /** Raw WP auth token — stored only in REAL mode for WC REST calls */
  wpToken?: string
  /** WhatsApp contact number (E.164-ish), captured in profile */
  whatsapp?: string
  /** Cached billing/shipping for checkout prefill */
  billing?: Address
  shipping?: Address
}

// ── minimal HS256 JWT (no external dep) ─────────────────────────────────────

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function signToken(payload: object): string {
  const secret = getSecret()
  const h = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const p = b64url(JSON.stringify(payload))
  const sig = b64url(crypto.createHmac('sha256', secret).update(`${h}.${p}`).digest())
  return `${h}.${p}.${sig}`
}

function verifyToken(token: string): AuthUser | null {
  try {
    const secret = getSecret()
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [h, p, sig] = parts
    const expected = b64url(crypto.createHmac('sha256', secret).update(`${h}.${p}`).digest())
    if (sig !== expected) return null
    const payload = JSON.parse(Buffer.from(p, 'base64url').toString('utf8'))
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload as AuthUser
  } catch {
    return null
  }
}

// ── public helpers ───────────────────────────────────────────────────────────

export function createAuthToken(user: AuthUser): string {
  return signToken({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    wpToken: user.wpToken,
    whatsapp: user.whatsapp,
    billing: user.billing,
    shipping: user.shipping,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + THIRTY_DAYS,
  })
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const jar = await cookies()
  const token = jar.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export async function setAuthCookie(user: AuthUser): Promise<string> {
  const token = createAuthToken(user)
  const jar = await cookies()
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: THIRTY_DAYS,
  })
  return token
}

export async function clearAuthCookie(): Promise<void> {
  const jar = await cookies()
  jar.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}
