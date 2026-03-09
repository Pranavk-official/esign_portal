/**
 * Health Check Endpoint
 *
 * GET /api/health
 *
 * Used by:
 * - Docker HEALTHCHECK instruction in the Dockerfile
 * - Coolify rolling-update health check
 * - Nginx upstream health check
 * - External monitoring (Zabbix, Nagios, Prometheus blackbox exporter)
 *
 * Returns HTTP 200 with JSON body when the Next.js process is alive.
 * No auth required — this endpoint is public by design.
 *
 * The response includes a timestamp and build version so operators
 * can quickly confirm which build is live on the VM.
 */
export function GET() {
  return Response.json(
    {
      status: "ok",
      service: "esign-portal",
      version: process.env.DEPLOYMENT_VERSION ?? "dev",
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
