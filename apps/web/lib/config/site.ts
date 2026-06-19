const raw = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.mygift.pk'

// Guard against a developer's .env.local leaking into a production build.
// If Vercel's NEXT_PUBLIC_SITE_URL is accidentally set to localhost, use the
// canonical production URL so canonicals/OG URLs are never broken.
const resolved =
  process.env.NODE_ENV === 'production' && raw.includes('localhost')
    ? 'https://www.mygift.pk'
    : raw

export const BASE_URL = resolved.replace(/\/$/, '')
