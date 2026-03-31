import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow importing from packages/* in the monorepo
  transpilePackages: ['@str-cleaning/assets'],
  images: {
    // No external domains needed — all images are local
  },
}

export default nextConfig
