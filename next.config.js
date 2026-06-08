/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'qf-backend'],
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: 'http://qf-backend:8000/:path*',
        },
      ],
    }
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://qf-backend:8000',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://qf-backend:8000/ws',
  },
}

module.exports = nextConfig
