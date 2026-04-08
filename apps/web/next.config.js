/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

const securityHeaders = () => {
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    // Allow inline styles only in development; be strict in production
    (isProd ? "style-src 'self' 'unsafe-inline'" : "style-src 'self' 'unsafe-inline'"),
    // Next dev needs eval/websocket; keep strict in prod
    isProd ? "script-src 'self' 'unsafe-inline' https://js.stripe.com" : "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    isProd ? "frame-src 'self' https://js.stripe.com https://hooks.stripe.com" : "frame-src 'self'",
    isProd ? "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.orange.com" : "connect-src 'self' ws: http://localhost:* https://*.supabase.co wss://*.supabase.co",
    "img-src 'self' data: https://images.unsplash.com https://via.placeholder.com https://*.supabase.co",
    "font-src 'self' data:",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; ')

  /** @type {import('next/dist/server/config-shared').Header[]} */
  return [
    {
      key: 'Content-Security-Policy',
      value: csp,
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff',
    },
    {
      key: 'X-Frame-Options',
      value: 'DENY',
    },
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin',
    },
    {
      key: 'Permissions-Policy',
      value: 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
    },
    {
      key: 'X-DNS-Prefetch-Control',
      value: 'off',
    },
    // HSTS only in production over HTTPS
    ...(isProd
      ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]
      : []),
  ]
}

const nextConfig = {
  poweredByHeader: false,
  compiler: {
    removeConsole: isProd ? { exclude: ['error', 'warn'] } : false,
  },
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders(),
      },
    ]
  },
}

module.exports = nextConfig
