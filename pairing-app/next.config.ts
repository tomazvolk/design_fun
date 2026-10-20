import type { NextConfig } from "next";

/**
 * Prototype build: a fully static export served from the design-fun shelf at /pairing.
 * The pairing graph ships as public/graph.json; everything else lives in the browser.
 */
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/pairing",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
