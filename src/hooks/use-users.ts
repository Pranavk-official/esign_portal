import { useQuery } from "@tanstack/react-query";

import type { UserQueryParams } from "@/lib/api/types";
import { usersApi } from "@/lib/api/users";

export function useUsers(params?: UserQueryParams) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => usersApi.listAll(params),
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ["users", userId],
    queryFn: () => usersApi.get(userId),
    enabled: !!userId,
  });
}

export function usePortalUsers(portalId: string, params?: UserQueryParams) {
  return useQuery({
    queryKey: ["portal-users", portalId, params],
    queryFn: () => usersApi.listByPortal(portalId, params),
    enabled: !!portalId,
  });
}

export function useMyPortalUsers(params?: UserQueryParams) {
  return useQuery({
    queryKey: ["portal-users", "me", params],
    queryFn: () => usersApi.listMyUsers(params),
  });
}

export function useMyPortalUser(userId: string) {
  return useQuery({
    queryKey: ["portal-users", "me", userId],
    queryFn: () => usersApi.getFromMyPortal(userId),
    enabled: !!userId,
  });
}
