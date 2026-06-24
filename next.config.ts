import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root to THIS project so Next doesn't get confused by the
  // stray C:\Users\user\yarn.lock when inferring the Turbopack root.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
