import { PHASE_DEVELOPMENT_SERVER } from "next/dist/shared/lib/constants";

export default (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  /*
   * @type {import('next').NextConfig}
   */
  const nextConfig = {
    assetPrefix: isDev ? undefined : "https://cdn.avon.ac",
  };
  return nextConfig;
};
