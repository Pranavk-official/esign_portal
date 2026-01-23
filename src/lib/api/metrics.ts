import type { MetricsResponse } from "@/lib/schemas/metrics";

import { apiClient } from "./client";
import type { SystemOverviewMetrics } from "./types";

/**
 * Metrics API
 *
 * API methods for fetching dashboard metrics and analytics.
 */

export const metricsApi = {
  /**
   * Get metrics for the current portal (department manager view)
   * GET /admin/portals/me/metrics
   */
  getMyMetrics: async (): Promise<MetricsResponse> => {
    const response = await apiClient.get<MetricsResponse>("/admin/portals/me/metrics");
    return response.data;
  },

  /**
   * Get system-wide overview metrics (Super Admin only)
   * GET /admin/system/overview
   */
  getSystemOverview: async (): Promise<SystemOverviewMetrics> => {
    const response = await apiClient.get<SystemOverviewMetrics>("/admin/system/overview");
    return response.data;
  },
};
