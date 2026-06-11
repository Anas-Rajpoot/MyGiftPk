import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'admin.mygift.pk' },
      { protocol: 'https', hostname: 'anas.inflowcommerce.com' },
    ],
  },
}

export default nextConfig
