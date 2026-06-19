import { NextRequest } from 'next/server'
import { BASE_URL as SITE } from '@/lib/config/site'

export function validateOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin')
  // No Origin header: server-to-server or same-site navigation — allowed.
  if (!origin) return true

  const siteOrigin = new URL(SITE).origin
  if (origin === siteOrigin) return true

  // Allow any localhost port in development
  if (
    process.env.NODE_ENV !== 'production' &&
    /^https?:\/\/localhost(:\d+)?$/.test(origin)
  ) {
    return true
  }

  return false
}
