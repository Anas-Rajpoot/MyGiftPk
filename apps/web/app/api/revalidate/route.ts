import { revalidateTag } from 'next/cache'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  let body: { secret?: string; tags?: string[] }

  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.secret || body.secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ error: 'Invalid secret' }, { status: 401 })
  }

  const tags = Array.isArray(body.tags) ? body.tags : []

  for (const tag of tags) {
    if (typeof tag === 'string' && tag.length > 0) {
      revalidateTag(tag, 'max')
    }
  }

  return Response.json({ revalidated: true, tags })
}
