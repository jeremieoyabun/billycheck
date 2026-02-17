import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep pdf-parse out of the webpack bundle so that its index.js
  // "isDebugMode = !module.parent" check works correctly (module.parent
  // is defined in Node but undefined in webpack, which triggers a
  // readFileSync of a non-existent test file).
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
