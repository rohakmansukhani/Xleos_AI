import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["localhost"],
  },
  async rewrites() {
    // Only proxy in development
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/:path*",
          destination: "http://localhost:8000/api/:path*",
        },
        {
          source: "/auth/:path*",
          destination: "http://localhost:8000/auth/:path*",
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
