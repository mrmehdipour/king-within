import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Pin the workspace root to THIS project so Next doesn't get confused by the
  // stray C:\Users\user\yarn.lock when inferring the Turbopack root.
  turbopack: {
    root: path.resolve(__dirname),
  },

  // Static export → produces ./out, which Capacitor packages into the Android
  // WebView. The whole app is client-rendered, so this is a clean fit.
  output: "export",

  // next/image optimization needs a server; disable it for the static bundle.
  images: { unoptimized: true },

  // Emit each route as a folder with index.html — friendliest for file:// in
  // the WebView and for static hosting on the web.
  trailingSlash: true,
};

export default nextConfig;
