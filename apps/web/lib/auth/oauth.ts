/* Custom OAuth (Google + Facebook) — server-only, no external dependencies.
   Flow: /api/auth/oauth/[provider] → provider consent → /callback → find/create
   WooCommerce customer → issue mygift-auth JWT (see lib/auth/server.ts). */

import crypto from 'crypto'
import type { AuthUser } from './server'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const WP_BASE = (process.env.WP_GRAPHQL_URL ?? '').replace(/\/graphql\/?$/, '')
const WC_KEY = process.env.WC_CONSUMER_KEY ?? ''
const WC_SECRET = process.env.WC_CONSUMER_SECRET ?? ''
const WC_ENABLED = Boolean(WP_BASE && WC_KEY && WC_SECRET)

export type Provider = 'google' | 'facebook'

export function isProvider(v: string): v is Provider {
  return v === 'google' || v === 'facebook'
}

interface ProviderConfig {
  clientId: string
  clientSecret: string
  authUrl: string
  tokenUrl: string
  scope: string
}

export function getProviderConfig(provider: Provider): ProviderConfig {
  if (provider === 'google') {
    return {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      scope: 'openid email profile',
    }
  }
  return {
    clientId: process.env.FACEBOOK_CLIENT_ID ?? '',
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? '',
    authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
    scope: 'email,public_profile',
  }
}

export function isProviderConfigured(provider: Provider): boolean {
  const c = getProviderConfig(provider)
  return Boolean(c.clientId && c.clientSecret)
}

export function redirectUri(provider: Provider): string {
  return `${SITE}/api/auth/oauth/${provider}/callback`
}

export function randomState(): string {
  return crypto.randomBytes(16).toString('hex')
}

/** Build the provider consent URL the user is redirected to. */
export function buildAuthUrl(provider: Provider, state: string): string {
  const cfg = getProviderConfig(provider)
  const url = new URL(cfg.authUrl)
  url.searchParams.set('client_id', cfg.clientId)
  url.searchParams.set('redirect_uri', redirectUri(provider))
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', cfg.scope)
  url.searchParams.set('state', state)
  if (provider === 'google') {
    url.searchParams.set('access_type', 'online')
    url.searchParams.set('prompt', 'select_account')
  }
  return url.toString()
}

export interface OAuthProfile {
  email: string
  firstName: string
  lastName: string
}

/** Exchange the authorization code for the user's verified profile. */
export async function exchangeCodeForProfile(
  provider: Provider,
  code: string
): Promise<OAuthProfile | null> {
  const cfg = getProviderConfig(provider)

  if (provider === 'google') {
    const tokenRes = await fetch(cfg.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        redirect_uri: redirectUri('google'),
        grant_type: 'authorization_code',
      }),
      cache: 'no-store',
    })
    if (!tokenRes.ok) return null
    const { access_token } = await tokenRes.json()
    if (!access_token) return null

    const infoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
      cache: 'no-store',
    })
    if (!infoRes.ok) return null
    const info = await infoRes.json()
    if (!info.email) return null
    return {
      email: String(info.email).toLowerCase(),
      firstName: info.given_name ?? '',
      lastName: info.family_name ?? '',
    }
  }

  // Facebook
  const tokenUrl = new URL(cfg.tokenUrl)
  tokenUrl.searchParams.set('client_id', cfg.clientId)
  tokenUrl.searchParams.set('client_secret', cfg.clientSecret)
  tokenUrl.searchParams.set('redirect_uri', redirectUri('facebook'))
  tokenUrl.searchParams.set('code', code)
  const tokenRes = await fetch(tokenUrl.toString(), { cache: 'no-store' })
  if (!tokenRes.ok) return null
  const { access_token } = await tokenRes.json()
  if (!access_token) return null

  const meUrl = new URL('https://graph.facebook.com/me')
  meUrl.searchParams.set('fields', 'email,first_name,last_name')
  meUrl.searchParams.set('access_token', access_token)
  const meRes = await fetch(meUrl.toString(), { cache: 'no-store' })
  if (!meRes.ok) return null
  const me = await meRes.json()
  if (!me.email) return null
  return {
    email: String(me.email).toLowerCase(),
    firstName: me.first_name ?? '',
    lastName: me.last_name ?? '',
  }
}

/** Find a WooCommerce customer by email, or create one. Returns an AuthUser. */
export async function findOrCreateCustomer(profile: OAuthProfile): Promise<AuthUser | null> {
  // Mock fallback for local dev without WC REST configured
  if (!WC_ENABLED) {
    return {
      id: Math.abs(hashCode(profile.email)),
      email: profile.email,
      firstName: profile.firstName || 'Member',
      lastName: profile.lastName || '',
      role: 'customer',
    }
  }

  const creds = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64')
  const auth = { Authorization: `Basic ${creds}` }

  // Look up existing customer by email
  const findUrl = new URL(`${WP_BASE}/wp-json/wc/v3/customers`)
  findUrl.searchParams.set('email', profile.email)
  const findRes = await fetch(findUrl.toString(), { headers: auth, cache: 'no-store' })
  if (findRes.ok) {
    const list = await findRes.json()
    if (Array.isArray(list) && list.length > 0) {
      const c = list[0]
      return {
        id: c.id,
        email: c.email,
        firstName: c.first_name || profile.firstName,
        lastName: c.last_name || profile.lastName,
        role: 'customer',
      }
    }
  }

  // Create a new customer with a random password (social users never use it)
  const createRes = await fetch(`${WP_BASE}/wp-json/wc/v3/customers`, {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: profile.email,
      first_name: profile.firstName,
      last_name: profile.lastName,
      username: profile.email,
      password: crypto.randomBytes(24).toString('base64url'),
    }),
    cache: 'no-store',
  })
  if (!createRes.ok) return null
  const c = await createRes.json()
  return {
    id: c.id,
    email: c.email,
    firstName: c.first_name || profile.firstName,
    lastName: c.last_name || profile.lastName,
    role: 'customer',
  }
}

function hashCode(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  }
  return h || 1
}
