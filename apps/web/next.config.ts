import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  turbopack: {
    // Point to monorepo root so Turbopack doesn't get confused by nested lockfiles
    root: path.resolve(__dirname, '../..'),
  },
}

export default nextConfig
