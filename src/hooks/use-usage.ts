import { useQuery } from "@tanstack/react-query";

import { portalsApi } from "@/lib/api/portals";
import type { ApiUsageQueryParams } from "@/lib/api/types";
import { usageApi } from "@/lib/api/usage";

export function useUsage(params?: ApiUsageQueryParams) {
  return useQuery({
    queryKey: ["usage", params],
    queryFn: () => usageApi.listAll(params),
  });
}

export function useUsageSummary(
  params?: Omit<ApiUsageQueryParams, "page" | "page_size" | "sort_by" | "sort_order" | "search">
) {
  return useQuery({
    queryKey: ["usage-summary", params],
    queryFn: () => usageApi.getSummary(params),
  });
}

export function usePortalUsage(portalId: string, params?: ApiUsageQueryParams) {
  return useQuery({
    queryKey: ["portal-usage", portalId, params],
    queryFn: () => portalsApi.getPortalUsage(portalId, params),
    enabled: !!portalId,
  });
}

export function useMyUsage(params?: ApiUsageQueryParams) {
  return useQuery({
    queryKey: ["my-usage", params],
    queryFn: () => portalsApi.getMyUsage(params),
  });
}

export function useMyKeyUsage(keyId: string, params?: ApiUsageQueryParams) {
  return useQuery({
    queryKey: ["my-key-usage", keyId, params],
    queryFn: () => portalsApi.getKeyUsage(keyId, params),
    enabled: !!keyId,
  });
}

export function useApiKeyUsage(portalId: string, keyId: string, params?: ApiUsageQueryParams) {
  return useQuery({
    queryKey: ["api-key-usage", portalId, keyId, params],
    queryFn: () => portalsApi.getPortalKeyUsage(portalId, keyId, params),
    enabled: !!(portalId && keyId),
  });
}
