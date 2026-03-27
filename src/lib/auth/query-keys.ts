/**
 * Query Key Factory — centralised key definitions for React Query.
 *
 * Using a factory ensures type-safe, collision-free cache keys and makes
 * targeted invalidation straightforward.
 *
 * Pattern:
 *   queryKeys.domain.all          → invalidate everything for that domain
 *   queryKeys.domain.lists()      → invalidate all list variations
 *   queryKeys.domain.list(params) → match a specific list query
 *   queryKeys.domain.detail(id)   → match a single entity
 */
export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },

  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (params?: unknown) => [...queryKeys.users.lists(), params] as const,
    detail: (userId: string) => [...queryKeys.users.all, userId] as const,
  },

  portalUsers: {
    all: ["portal-users"] as const,
    lists: () => [...queryKeys.portalUsers.all, "list"] as const,
    list: (portalId: string, params?: unknown) =>
      [...queryKeys.portalUsers.lists(), portalId, params] as const,
    my: (params?: unknown) => [...queryKeys.portalUsers.all, "me", params] as const,
    myDetail: (userId: string) => [...queryKeys.portalUsers.all, "me", userId] as const,
  },

  portals: {
    all: ["portals"] as const,
    lists: () => [...queryKeys.portals.all, "list"] as const,
    list: (params?: unknown) => [...queryKeys.portals.lists(), params] as const,
    detail: (portalId: string) => [...queryKeys.portals.all, portalId] as const,
    my: () => [...queryKeys.portals.all, "my"] as const,
    metrics: () => [...queryKeys.portals.all, "metrics"] as const,
    keys: (portalId: string, params?: unknown) =>
      [...queryKeys.portals.all, portalId, "keys", params] as const,
    usageSummary: (params?: unknown) =>
      [...queryKeys.portals.all, "usage-summary", params] as const,
    portalUsageSummary: (portalId: string, params?: unknown) =>
      [...queryKeys.portals.all, portalId, "usage-summary", params] as const,
  },

  apiKeys: {
    all: ["api-keys"] as const,
    lists: () => [...queryKeys.apiKeys.all, "list"] as const,
    list: (params?: unknown) => [...queryKeys.apiKeys.lists(), params] as const,
  },

  usage: {
    all: ["usage"] as const,
    list: (params?: unknown) => [...queryKeys.usage.all, "list", params] as const,
    summary: (params?: unknown) => [...queryKeys.usage.all, "summary", params] as const,
    portal: (portalId: string, params?: unknown) =>
      [...queryKeys.usage.all, "portal", portalId, params] as const,
    my: (params?: unknown) => [...queryKeys.usage.all, "my", params] as const,
    myKey: (keyId: string, params?: unknown) =>
      [...queryKeys.usage.all, "my-key", keyId, params] as const,
    apiKey: (portalId: string, keyId: string, params?: unknown) =>
      [...queryKeys.usage.all, "api-key", portalId, keyId, params] as const,
  },

  auditLogs: {
    all: ["audit-logs"] as const,
    list: (params?: unknown) => [...queryKeys.auditLogs.all, params] as const,
  },

  metrics: {
    all: ["metrics"] as const,
    overview: () => [...queryKeys.metrics.all, "overview"] as const,
  },
};

/** @deprecated Use `queryKeys.auth` instead */
export const authKeys = queryKeys.auth;
