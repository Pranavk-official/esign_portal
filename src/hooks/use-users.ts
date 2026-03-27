import { useQuery } from "@tanstack/react-query";

import type { UserQueryParams } from "@/lib/api/types";
import { usersApi } from "@/lib/api/users";
import { queryKeys } from "@/lib/auth/query-keys";

export function useUsers(params?: UserQueryParams) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => usersApi.listAll(params),
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => usersApi.get(userId),
    enabled: !!userId,
  });
}

export function usePortalUsers(portalId: string, params?: UserQueryParams) {
  return useQuery({
    queryKey: queryKeys.portalUsers.list(portalId, params),
    queryFn: () => usersApi.listByPortal(portalId, params),
    enabled: !!portalId,
  });
}

export function useMyPortalUsers(params?: UserQueryParams) {
  return useQuery({
    queryKey: queryKeys.portalUsers.my(params),
    queryFn: () => usersApi.listMyUsers(params),
  });
}

export function useMyPortalUser(userId: string) {
  return useQuery({
    queryKey: queryKeys.portalUsers.myDetail(userId),
    queryFn: () => usersApi.getFromMyPortal(userId),
    enabled: !!userId,
  });
}
