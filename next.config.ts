import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Let phones on your Wi-Fi (e.g. http://192.168.x.x:3000) use the dev server. Dev only; no effect on Vercel.
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.20.10.*"],
  turbopack: {
    root: import.meta.dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
