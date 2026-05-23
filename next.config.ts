import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the Cloudflare tunnel host to reach dev resources (HMR, etc.)
  // when testing the Telegram Mini App on a device. Harmless in production.
  allowedDevOrigins: ["*.trycloudflare.com"],
};

export default nextConfig;
