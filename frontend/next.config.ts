import type { NextConfig } from "next";
import { hostname } from "os";

const nextConfig: NextConfig = {
  cacheComponents: true,
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.avon.ac",
      },
    ],
  },
};

export default nextConfig;
