const withPWA = require('next-pwa');

/** @type {import('next').NextConfig} */
const config = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})({
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/strength-training-tracker',
});

module.exports = config; 