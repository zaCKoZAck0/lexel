import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('https://img.youtube.com/vi/**')],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['*.app.github.dev', 'localhost:3000'],
    },
  },
  allowedDevOrigins: ['*.app.github.dev', 'localhost:3000'],
};

export default nextConfig;
