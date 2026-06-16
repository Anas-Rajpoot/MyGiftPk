import { NextRequest, NextResponse } from 'next/server'
import {
  isProvider,
  isProviderConfigured,
  buildAuthUrl,
  randomState,
} from '@/lib/auth/oauth'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params

  if (!isProvider(provider)) {
    return NextResponse.redirect(new URL('/account/login?error=oauth_unknown', SITE))
  }

  if (!isProviderConfigured(provider)) {
    return NextResponse.redirect(new URL('/account/login?error=oauth_unavailable', SITE))
  }

  const state = randomState()
  const res = NextResponse.redirect(buildAuthUrl(provider, state))

  // CSRF state cookie (short-lived)
  res.cookies.set(`oauth_state_${provider}`, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })

  // Preserve post-login redirect target
  const next = req.nextUrl.searchParams.get('next')
  if (next && next.startsWith('/')) {
    res.cookies.set('oauth_next', next, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })
  }

  return res
}
