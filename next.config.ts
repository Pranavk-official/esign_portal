import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Standalone output ────────────────────────────────────────────────────
  // Generates .next/standalone — a self-contained directory with only the
  // production-required files. The Dockerfile copies this into the runtime
  // image, keeping the container minimal.
  // https://nextjs.org/docs/app/api-reference/config/next-config-js/output
  output: "standalone",

  // ── Version skew protection ──────────────────────────────────────────────
  // During rolling updates, multiple container versions may briefly coexist.
  // deploymentId ties client-side JS chunks to the build that produced them,
  // preventing chunk-not-found 404s on in-flight requests.
  // Set DEPLOYMENT_VERSION to a git SHA or semver tag at build/deploy time.
  deploymentId: process.env.DEPLOYMENT_VERSION,

  // ── Backend URL is server-side only ─────────────────────────────────────
  // BACKEND_URL is NOT listed here (that would bake it into the client
  // bundle). It is read at runtime by the /api/[...path] proxy route via
  // process.env.BACKEND_URL — never exposed to the browser.
  serverExternalPackages: [],
};

export default nextConfig;



