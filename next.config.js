// ============================================
// FILE: next.config.js
// LOCATION: /next.config.js
// PURPOSE: Next.js configuration
// ============================================

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['i.postimg.cc', 'i.ibb.co', 'localhost'],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
