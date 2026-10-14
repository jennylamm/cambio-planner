import type { NextConfig } from "next";

// Static export for GitHub Pages. Set BASE_PATH to the repository name when
// deploying (e.g. /cambio-planner); leave unset for local development.
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
