import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  assetPrefix: "https://things-seven.vercel.app",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
