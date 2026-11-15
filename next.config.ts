import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // lets the dev server be opened through a temporary Cloudflare tunnel link (for sharing a preview)
  allowedDevOrigins: ["*.trycloudflare.com"],
};

export default nextConfig;
