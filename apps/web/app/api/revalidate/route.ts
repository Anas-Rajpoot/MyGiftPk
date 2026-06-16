import { revalidateTag } from 'next/cache'
import { NextRequest } from 'next/server'
import crypto from 'crypto'

const FIVE_MINUTES = 5 * 60 * 1000

/** Constant-time string comparison to avoid timing side-channels on the secret. */
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return crypto.timingSafeEqual(ab, bb)
}

export async function POST(request: NextRequest) {
  let body: { secret?: string; tags?: string[]; timestamp?: number }

  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const secret = process.env.REVALIDATE_SECRET
  if (!secret || !body.secret || !safeEqual(body.secret, secret)) {
    return Response.json({ error: 'Invalid secret' }, { status: 401 })
  }

  // Optional replay-attack guard: reject if timestamp is older than 5 minutes
  if (typeof body.timestamp === 'number') {
    if (Math.abs(Date.now() - body.timestamp) > FIVE_MINUTES) {
      return Response.json({ error: 'Request expired' }, { status: 401 })
    }
  }

  const tags = Array.isArray(body.tags) ? body.tags : []

  for (const tag of tags) {
    if (typeof tag === 'string' && tag.length > 0) {
      revalidateTag(tag, 'max')
    }
  }

  return Response.json({ revalidated: true, tags })
}
