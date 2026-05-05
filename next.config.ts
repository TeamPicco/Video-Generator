import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.bfl.ai' },
      { protocol: 'https', hostname: '**.runwayml.com' },
      { protocol: 'https', hostname: '**.klingai.com' },
    ],
  },
  serverExternalPackages: ['fluent-ffmpeg'],
}

export default nextConfig
