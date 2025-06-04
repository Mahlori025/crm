import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost'],
  },
  experimental: {
    serverActions: true,
  },
};

export default nextConfig;