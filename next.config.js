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
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/strength-training-tracker' : '',
});

module.exports = config; 