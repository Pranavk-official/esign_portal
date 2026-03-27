"use client";

import { useQuery } from "@tanstack/react-query";

import { metricsApi } from "@/lib/api/metrics";
import { queryKeys } from "@/lib/auth/query-keys";

/**
 * Hook for fetching system overview metrics (Super Admin only)
 *
 * Fetches system-wide overview metrics for the Super Admin dashboard.
 */
export function useSystemOverview() {
  return useQuery({
    queryKey: queryKeys.metrics.overview(),
    queryFn: () => metricsApi.getSystemOverview(),
    staleTime: 60 * 1000, // 1 minute
  });
}
