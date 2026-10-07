import type { NextConfig } from "next";

/**
 * Prototype build: a fully static export served from the design-fun shelf at /bledara.
 * All data is in-browser dummy data (src/data); there is no server or database yet.
 */
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/bledara",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
