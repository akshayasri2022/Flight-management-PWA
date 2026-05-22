const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline',
  },
  runtimeCaching: [
    // StaleWhileRevalidate for flight search API results
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/flights/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'flight-search-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
      },
    },
    // CacheFirst for static assets
    {
      urlPattern: /\.(?:js|css|woff2?|png|jpg|svg|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    // NetworkFirst for bookings (so offline cache is populated)
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/bookings/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'bookings-cache',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24, // 24 hours
        },
        networkTimeoutSeconds: 5,
      },
    },
    // StaleWhileRevalidate for Next.js pages
    {
      urlPattern: /^\//,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'pages-cache',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24,
        },
      },
    },
  ],
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Required for Supabase server-side auth
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
}

module.exports = withPWA(nextConfig)
