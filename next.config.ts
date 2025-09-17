import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Only proxy in development
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'https://api.xleos.com/api/:path*',
        },
        {
          source: '/auth/:path*',
          destination: 'https://api.xleos.com/auth/:path*',
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
