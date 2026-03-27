import { useQuery } from "@tanstack/react-query";

import { portalsApi } from "@/lib/api/portals";
import { ApiUsageQueryParams, PortalQueryParams } from "@/lib/api/types";
import { queryKeys } from "@/lib/auth/query-keys";

export function usePortals(params?: PortalQueryParams) {
  return useQuery({
    queryKey: queryKeys.portals.list(params),
    queryFn: () => portalsApi.listAll(params),
  });
}

export function usePortal(portalId: string) {
  return useQuery({
    queryKey: queryKeys.portals.detail(portalId),
    queryFn: () => portalsApi.get(portalId),
    enabled: !!portalId,
  });
}

export function useMyPortal() {
  return useQuery({
    queryKey: queryKeys.portals.my(),
    queryFn: () => portalsApi.getMyPortal(),
  });
}

export function usePortalMetrics() {
  return useQuery({
    queryKey: queryKeys.portals.metrics(),
    queryFn: () => portalsApi.getMetrics(),
  });
}

export function usePortalKeys(portalId: string, params?: any) {
  return useQuery({
    queryKey: queryKeys.portals.keys(portalId, params),
    queryFn: () => portalsApi.listPortalKeys(portalId, params),
    enabled: !!portalId,
  });
}

export function usePortalUsageSummary(params?: ApiUsageQueryParams) {
  return useQuery({
    queryKey: queryKeys.portals.usageSummary(params),
    queryFn: () => portalsApi.getUsageSummary(params),
  });
}

export function usePortalSpecificUsageSummary(portalId: string, params?: ApiUsageQueryParams) {
  return useQuery({
    queryKey: queryKeys.portals.portalUsageSummary(portalId, params),
    queryFn: () => portalsApi.getPortalUsageSummary(portalId, params),
    enabled: !!portalId,
  });
}
