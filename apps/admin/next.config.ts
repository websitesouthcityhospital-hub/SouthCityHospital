import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "10.135.48.122",
    "10.135.48.122:3000",
    "10.135.48.122:3001",
    "10.173.241.10",
    "10.173.241.10:3001",
    "localhost:3001",
  ],
  transpilePackages: ["@sch/types"],
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
