import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disabled for this project: dashboard pages read the session cookie on
  // every request, so classic dynamic rendering is simpler than Cache Components.
  cacheComponents: false,
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
