"use client";

import { useQuery } from "@tanstack/react-query";

import { metricsApi } from "@/lib/api/metrics";

/**
 * Hook for fetching dashboard metrics
 *
 * Fetches transaction metrics for the current portal.
 */
export function useMetrics() {
  return useQuery({
    queryKey: ["metrics"],
    queryFn: () => metricsApi.getMyMetrics(),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook for fetching system overview metrics (Super Admin only)
 *
 * Fetches system-wide overview metrics for the Super Admin dashboard.
 */
export function useSystemOverview() {
  return useQuery({
    queryKey: ["system-overview"],
    queryFn: () => metricsApi.getSystemOverview(),
    staleTime: 60 * 1000, // 1 minute
  });
}
