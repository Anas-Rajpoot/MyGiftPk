import { NextRequest, NextResponse } from 'next/server'

// Public account routes that must stay reachable while logged out.
const PUBLIC_ACCOUNT_ROUTES = [
  '/account/login',
  '/account/register',
  '/account/forgot-password',
  '/account/reset-password',
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = PUBLIC_ACCOUNT_ROUTES.some((p) => pathname.startsWith(p))

  if (pathname.startsWith('/account') && !isPublic) {
    const authCookie = request.cookies.get('mygift-auth')
    if (!authCookie?.value) {
      const loginUrl = new URL('/account/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/account/:path*'],
}
