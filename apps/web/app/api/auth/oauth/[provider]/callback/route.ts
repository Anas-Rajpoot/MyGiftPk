import { NextRequest, NextResponse } from 'next/server'
import { setAuthCookie } from '@/lib/auth/server'
import {
  isProvider,
  isProviderConfigured,
  exchangeCodeForProfile,
  findOrCreateCustomer,
} from '@/lib/auth/oauth'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

function fail(reason: string) {
  return NextResponse.redirect(new URL(`/account/login?error=${reason}`, SITE))
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params

  if (!isProvider(provider) || !isProviderConfigured(provider)) {
    return fail('oauth_unavailable')
  }

  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')
  const savedState = req.cookies.get(`oauth_state_${provider}`)?.value

  // User denied consent, or provider returned an error
  if (req.nextUrl.searchParams.get('error')) return fail('oauth_cancelled')

  // CSRF: state must be present and match the cookie we set
  if (!code || !state || !savedState || state !== savedState) {
    return fail('oauth_failed')
  }

  try {
    const profile = await exchangeCodeForProfile(provider, code)
    if (!profile?.email) return fail('oauth_no_email')

    const user = await findOrCreateCustomer(profile)
    if (!user) return fail('oauth_account')

    await setAuthCookie(user)

    // Resolve post-login redirect target
    const next = req.cookies.get('oauth_next')?.value
    const dest = next && next.startsWith('/account') ? next : '/account'

    const res = NextResponse.redirect(new URL(dest, SITE))
    // Clean up one-time cookies
    res.cookies.delete(`oauth_state_${provider}`)
    res.cookies.delete('oauth_next')
    return res
  } catch {
    return fail('oauth_failed')
  }
}
