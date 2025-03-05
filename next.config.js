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
  images: {
    unoptimized: true,
  },
  // 只在 GitHub Pages 部署时使用这些配置
  ...(process.env.GITHUB_PAGES === 'true' ? {
    output: 'export',
    basePath: '/strength-training-tracker'
  } : {})
});

module.exports = config; 