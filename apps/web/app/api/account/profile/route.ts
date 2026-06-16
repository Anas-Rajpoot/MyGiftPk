import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, setAuthCookie, type AuthUser, type Address } from '@/lib/auth/server'
import { validateOrigin } from '@/lib/utils/csrf'
import {
  cleanText,
  cleanPhone,
  cleanAddress,
  isValidWhatsApp,
  isEmptyAddress,
} from '@/lib/account/profile'

const MOCK_MODE = process.env.MOCK_MODE === 'true'
const WP_BASE = (process.env.WP_GRAPHQL_URL ?? '').replace(/\/graphql\/?$/, '')
const WC_KEY = process.env.WC_CONSUMER_KEY ?? ''
const WC_SECRET = process.env.WC_CONSUMER_SECRET ?? ''
const WC_ENABLED = Boolean(WP_BASE && WC_KEY && WC_SECRET)

function publicProfile(user: AuthUser) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    whatsapp: user.whatsapp ?? '',
    billing: user.billing ?? {},
    shipping: user.shipping ?? {},
  }
}

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // In real mode, pull the freshest customer record from WooCommerce
  if (!MOCK_MODE && WC_ENABLED) {
    try {
      const creds = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64')
      const res = await fetch(`${WP_BASE}/wp-json/wc/v3/customers/${user.id}`, {
        headers: { Authorization: `Basic ${creds}` },
        cache: 'no-store',
      })
      if (res.ok) {
        const c = await res.json()
        const whatsapp =
          (c.meta_data ?? []).find((m: { key: string }) => m.key === 'whatsapp_number')?.value ??
          user.whatsapp ?? ''
        return NextResponse.json({
          user: {
            id: c.id,
            email: c.email,
            firstName: c.first_name ?? user.firstName,
            lastName: c.last_name ?? user.lastName,
            whatsapp,
            billing: c.billing ?? {},
            shipping: c.shipping ?? {},
          },
        })
      }
    } catch {
      // fall through to cookie data
    }
  }

  return NextResponse.json({ user: publicProfile(user) })
}

export async function PATCH(req: NextRequest) {
  if (!validateOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: {
    firstName?: string
    lastName?: string
    whatsapp?: string
    billing?: unknown
    shipping?: unknown
    shippingSameAsBilling?: boolean
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const firstName = body.firstName !== undefined ? cleanText(body.firstName, 60) : user.firstName
  const lastName = body.lastName !== undefined ? cleanText(body.lastName, 60) : user.lastName
  const whatsapp = body.whatsapp !== undefined ? cleanPhone(body.whatsapp) : (user.whatsapp ?? '')

  if (!isValidWhatsApp(whatsapp)) {
    return NextResponse.json(
      { error: 'Enter a valid WhatsApp number (10–15 digits, e.g. 03001234567).' },
      { status: 400 }
    )
  }

  const billing: Address = body.billing !== undefined ? cleanAddress(body.billing) : (user.billing ?? {})
  const shipping: Address = body.shippingSameAsBilling
    ? billing
    : body.shipping !== undefined
      ? cleanAddress(body.shipping)
      : (user.shipping ?? {})

  // Mirror WhatsApp into the billing phone if billing has no phone of its own
  if (whatsapp && !billing.phone) billing.phone = whatsapp

  const updated: AuthUser = {
    ...user,
    firstName,
    lastName,
    whatsapp,
    billing: isEmptyAddress(billing) ? undefined : billing,
    shipping: isEmptyAddress(shipping) ? undefined : shipping,
  }

  // Persist to WooCommerce in real mode
  if (!MOCK_MODE && WC_ENABLED) {
    try {
      const creds = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64')
      const res = await fetch(`${WP_BASE}/wp-json/wc/v3/customers/${user.id}`, {
        method: 'PUT',
        headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          billing,
          shipping,
          meta_data: [{ key: 'whatsapp_number', value: whatsapp }],
        }),
        cache: 'no-store',
      })
      if (!res.ok) return NextResponse.json({ error: 'Could not save changes. Please try again.' }, { status: 502 })
    } catch {
      return NextResponse.json({ error: 'Could not save changes. Please try again.' }, { status: 502 })
    }
  }

  // Always update the cookie so identity + prefill stay fresh
  await setAuthCookie(updated)

  return NextResponse.json({ ok: true, user: publicProfile(updated) })
}
