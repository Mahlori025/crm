// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   images: {
//     domains: ['localhost'],
//   },
//   experimental: {
//     serverActions: true,
//   },
// };

// export default nextConfig;

// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Remove the experimental serverActions as it's no longer needed in Next.js 15
};

export default nextConfig;