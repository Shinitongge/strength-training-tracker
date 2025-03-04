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
});

module.exports = config; 