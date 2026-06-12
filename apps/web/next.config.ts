import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'admin.mygift.pk' },
      { protocol: 'https', hostname: 'anas.inflowcommerce.com' },
    ],
  },
}

export default nextConfig
