import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/dist/shared/lib/constants";

module.exports = (phase: string, {defaultConfig}: any) => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      /* development only config options here */
      cacheComponents: true,

      images: {
        remotePatterns: [
          {
            protocol: "https",
            hostname: "cdn.avon.ac",
          },
        ],
      },
      assetPrefix: undefined,
    };
  }

  return {
    /* config options for all phases except development here */
    cacheComponents: true,
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "cdn.avon.ac",
        },
      ],
    },
    assetPrefix: undefined,
  };
};
