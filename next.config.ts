import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Expose BACKEND_URL only to the Node.js server runtime (API routes, Server
  // Components). It is intentionally NOT in `env` (which embeds values in the
  // client bundle) because the backend IP must not be leaked to the browser.
  // process.env.BACKEND_URL is available server-side via the .env / .env.local files.
  serverExternalPackages: [],
};

export default nextConfig;
