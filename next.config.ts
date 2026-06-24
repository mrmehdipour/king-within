import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root to THIS project so Next doesn't get confused by the
  // stray C:\Users\user\yarn.lock when inferring the Turbopack root.
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Static export ONLY for the Capacitor build (BUILD_TARGET=capacitor) → ./out
  // for the Android WebView. The web deploy uses a normal build so the blog can
  // use ISR (SEO + near-instant content updates).
  ...(process.env.BUILD_TARGET === "capacitor"
    ? { output: "export" as const, trailingSlash: true }
    : {}),

  // next/image optimization needs a server; the app uses no next/image, so keep
  // it unoptimized for parity between both build targets.
  images: { unoptimized: true },
};

export default nextConfig;
