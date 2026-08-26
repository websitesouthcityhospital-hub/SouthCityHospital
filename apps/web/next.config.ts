import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin dev resources in the IDE preview environment and mobile LAN
  allowedDevOrigins: [
    "10.135.48.122",
    "10.135.48.122:3000",
    "10.173.241.10",
    "10.173.241.10:3000",
    "localhost:3000",
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
