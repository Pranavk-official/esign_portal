import { useQuery } from "@tanstack/react-query";

import { portalsApi } from "@/lib/api/portals";
import { ApiUsageQueryParams, PortalQueryParams } from "@/lib/api/types";

export function usePortals(params?: PortalQueryParams) {
  return useQuery({
    queryKey: ["portals", params],
    queryFn: () => portalsApi.listAll(params),
  });
}

export function usePortal(portalId: string) {
  return useQuery({
    queryKey: ["portals", portalId],
    queryFn: () => portalsApi.get(portalId),
    enabled: !!portalId,
  });
}

export function useMyPortal() {
  return useQuery({
    queryKey: ["my-portal"],
    queryFn: () => portalsApi.getMyPortal(),
  });
}

export function usePortalMetrics() {
  return useQuery({
    queryKey: ["portal-metrics"],
    queryFn: () => portalsApi.getMetrics(),
  });
}

export function usePortalKeys(portalId: string, params?: any) {
  return useQuery({
    queryKey: ["portal-keys", portalId, params],
    queryFn: () => portalsApi.listPortalKeys(portalId, params),
    enabled: !!portalId,
  });
}

export function usePortalUsageSummary(params?: ApiUsageQueryParams) {
  return useQuery({
    queryKey: ["portal-usage-summary", params],
    queryFn: () => portalsApi.getUsageSummary(params),
  });
}

export function usePortalSpecificUsageSummary(portalId: string, params?: ApiUsageQueryParams) {
  return useQuery({
    queryKey: ["portal-usage-summary", portalId, params],
    queryFn: () => portalsApi.getPortalUsageSummary(portalId, params),
    enabled: !!portalId,
  });
}
