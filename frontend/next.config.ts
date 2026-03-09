import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/dist/shared/lib/constants";

module.exports = (phase: string, _defaultConfig: NextConfig) => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      /* development only config options here */
      cacheComponents: true,
      experimental: {
        globalNotFound: true,
        middlewareClientMaxBodySize: 52 * 1024 * 1024,
        serverActions: {
          bodySizeLimit: "52mb",
        },
      },

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
    output: "standalone",
    experimental: {
      globalNotFound: true,
      middlewareClientMaxBodySize: 52 * 1024 * 1024,
      serverActions: {
        bodySizeLimit: "52mb",
      },
    },
    assetPrefix: undefined,
    images: {
      unoptimized: true,
      remotePatterns: [
        {
          protocol: "https",
          hostname: "cdn.avon.ac",
        },
      ],
    },
  };
};
