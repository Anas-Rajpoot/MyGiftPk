import { NextRequest, NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth/server'
import { validateOrigin } from '@/lib/utils/csrf'

export async function POST(req: NextRequest) {
  if (!validateOrigin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  await clearAuthCookie()
  return NextResponse.json({ ok: true })
}
