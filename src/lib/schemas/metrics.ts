import { z } from "zod";

/**
 * Metrics Schemas
 *
 * Zod schemas for dashboard metrics and analytics.
 */

// Metrics Response Schema (from OpenAPI /admin/portals/me/metrics)
export const metricsResponseSchema = z.object({
  total_transactions: z.number().int().nonnegative(),
  successful_transactions: z.number().int().nonnegative(),
  failed_transactions: z.number().int().nonnegative(),
  pending_transactions: z.number().int().nonnegative(),
});

export type MetricsResponse = z.infer<typeof metricsResponseSchema>;
