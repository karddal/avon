import { execSync } from "node:child_process";
import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/dist/shared/lib/constants";

function getBuildCommit() {
  if (process.env.NEXT_PUBLIC_BUILD_COMMIT) {
    return process.env.NEXT_PUBLIC_BUILD_COMMIT;
  }

  try {
    return execSync("git rev-parse --short HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "unknown";
  }
}

function getBuildDate() {
  return process.env.NEXT_PUBLIC_BUILD_DATE ?? new Date().toISOString();
}

function getBuildEnvironment() {
  const explicitEnvironment =
    process.env.NEXT_PUBLIC_APP_ENV ?? process.env.APP_ENV;

  if (explicitEnvironment) {
    return explicitEnvironment;
  }

  if (process.env.NODE_ENV === "production") {
    return "prod";
  }

  return "dev";
}

const buildCommit = getBuildCommit();
const buildDate = getBuildDate();
const buildEnvironment = getBuildEnvironment();

module.exports = (phase: string, _defaultConfig: NextConfig) => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      /* development only config options here */
      cacheComponents: true,
      env: {
        NEXT_PUBLIC_BUILD_COMMIT: buildCommit,
        NEXT_PUBLIC_BUILD_DATE: buildDate,
        NEXT_PUBLIC_APP_ENV: buildEnvironment,
      },
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
    env: {
      NEXT_PUBLIC_BUILD_COMMIT: buildCommit,
      NEXT_PUBLIC_BUILD_DATE: buildDate,
      NEXT_PUBLIC_APP_ENV: buildEnvironment,
    },
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
