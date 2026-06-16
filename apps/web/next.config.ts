import type { NextConfig } from 'next'
import path from 'path'

const isProd = process.env.NODE_ENV === 'production'

// Derive the WordPress host from WP_GRAPHQL_URL so next/image + CSP allow the
// live media domain automatically (works for staging and any future domain).
function wpHostname(): string | null {
  try {
    return process.env.WP_GRAPHQL_URL ? new URL(process.env.WP_GRAPHQL_URL).hostname : null
  } catch {
    return null
  }
}
const WP_HOST = wpHostname()
const imgHosts = Array.from(
  new Set([WP_HOST, 'admin.mygift.pk', 'wp-mygift-pk.stackstaging.com'].filter(Boolean))
) as string[]

const securityHeaders = [
  // Prevent clickjacking
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Control referrer in cross-origin requests
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable unused browser features
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  // XSS protection header (legacy browsers)
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // HSTS — only in production (breaks local dev with self-signed cert)
  ...(isProd
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
    : []),
  // Basic CSP — block object/embed embeds and frame-ancestors
  // Note: Next.js 16 requires 'unsafe-inline' for hydration scripts.
  // A nonce-based strict CSP can be added via middleware when Sentry + analytics are locked in.
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval for Next.js dev; prod builds strip it
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      `img-src 'self' data: blob: ${imgHosts.map((h) => `https://${h}`).join(' ')}`,
      "connect-src 'self'",
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: imgHosts.map((hostname) => ({ protocol: 'https' as const, hostname })),
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
