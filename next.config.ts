import type { NextConfig } from "next";
import withPWA from 'next-pwa';

const config: NextConfig = withPWA({
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

export default config;
