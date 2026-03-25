import { apiClient } from "./client";
import {
  ApiKeyDetailResponse,
  ApiKeyResponse,
  ApiUsageQueryParams,
  ApiUsageRecord,
  ApiUsageSummary,
  MetricsResponse,
  PaginatedResponse,
  PortalListResponse,
  PortalOnboardingRequest,
  PortalQueryParams,
  PortalResponse,
} from "./types";

/** V2: unified portal update (replaces v1 /status + /key-limits) */
export interface PortalUpdateV2Request {
  name?: string | null;
  is_active?: boolean | null;
  reason?: string | null;
  live_key_limit?: number | null;
}

/** V2: unified API key update (replaces v1 /status + /txn-count) */
export interface ApiKeyUpdateV2Request {
  is_active?: boolean | null;
  reason?: string | null;
  max_txn_count?: number | null;
  max_txn_count_threshold?: number | null;
}

// Legacy aliases kept for backward compatibility with hook callers
export type PortalStatusUpdateRequest = Pick<PortalUpdateV2Request, "is_active" | "reason">;
export type PortalKeyLimitUpdate = Pick<PortalUpdateV2Request, "live_key_limit">;
export type ApiKeyStatusUpdateRequest = Pick<ApiKeyUpdateV2Request, "is_active" | "reason">;
export type ApiKeyTxnCountUpdateRequest = Pick<
  ApiKeyUpdateV2Request,
  "max_txn_count" | "max_txn_count_threshold"
>;

/** V2 onboarding response — portal + admin user in one round-trip */
export interface PortalOnboardingResponseV2 {
  portal: PortalResponse;
  admin_user_id: string;
  admin_email: string;
  otp_sent: boolean;
}

export const portalsApi = {
  // List and get operations
  listAll: async (params?: PortalQueryParams) => {
    const response = await apiClient.get<PaginatedResponse<PortalListResponse>>(
      "/admin/v2/super/portals",
      { params }
    );
    return response.data;
  },

  get: async (portalId: string) => {
    const response = await apiClient.get<PortalListResponse>(
      `/admin/v2/super/portals/${portalId}`
    );
    return response.data;
  },

  onboard: async (data: PortalOnboardingRequest) => {
    const response = await apiClient.post<PortalOnboardingResponseV2>(
      "/admin/v2/super/portals/onboard",
      data
    );
    return response.data;
  },

  getMyPortal: async () => {
    const response = await apiClient.get<PortalResponse>("/admin/v2/portal/me");
    return response.data;
  },

  // Portal management operations - Super Admin only (v2 unified endpoints)
  /** Replaces v1 PATCH /status + PATCH /key-limits */
  updateStatus: async (portalId: string, data: PortalStatusUpdateRequest) => {
    const response = await apiClient.patch<PortalListResponse>(
      `/admin/v2/super/portals/${portalId}`,
      data
    );
    return response.data;
  },

  /** Replaces v1 PATCH /key-limits — field is now live_key_limit */
  updateKeyLimits: async (portalId: string, data: PortalKeyLimitUpdate) => {
    const response = await apiClient.patch<PortalListResponse>(
      `/admin/v2/super/portals/${portalId}`,
      data
    );
    return response.data;
  },

  /** Unified v2 portal update: name, is_active, reason, live_key_limit */
  updatePortal: async (portalId: string, data: PortalUpdateV2Request) => {
    const response = await apiClient.patch<PortalListResponse>(
      `/admin/v2/super/portals/${portalId}`,
      data
    );
    return response.data;
  },

  // API Keys for portal - Super Admin only (v2 endpoints)
  listPortalKeys: async (portalId: string, params?: any) => {
    const response = await apiClient.get<PaginatedResponse<ApiKeyDetailResponse>>(
      `/admin/v2/super/portals/${portalId}/keys`,
      { params }
    );
    return response.data;
  },

  /** Replaces v1 PATCH /keys/{id}/status */
  updateKeyStatus: async (portalId: string, keyId: string, data: ApiKeyStatusUpdateRequest) => {
    const response = await apiClient.patch<ApiKeyDetailResponse>(
      `/admin/v2/super/portals/${portalId}/keys/${keyId}`,
      data
    );
    return response.data;
  },

  /** Replaces v1 PATCH /keys/{id}/txn-count */
  updateKeyTxnCount: async (portalId: string, keyId: string, data: ApiKeyTxnCountUpdateRequest) => {
    const response = await apiClient.patch<ApiKeyDetailResponse>(
      `/admin/v2/super/portals/${portalId}/keys/${keyId}`,
      data
    );
    return response.data;
  },

  /** Unified v2 API key update: is_active, reason, max_txn_count, max_txn_count_threshold */
  updatePortalKey: async (portalId: string, keyId: string, data: ApiKeyUpdateV2Request) => {
    const response = await apiClient.patch<ApiKeyDetailResponse>(
      `/admin/v2/super/portals/${portalId}/keys/${keyId}`,
      data
    );
    return response.data;
  },

  updateKeyCallback: async (portalId: string, keyId: string, callbackUrl: string | null) => {
    // Note: no super-admin callback update endpoint in v2; this endpoint is portal-admin only
    const response = await apiClient.put<ApiKeyResponse>(
      `/admin/portals/${portalId}/keys/${keyId}/callback`,
      { callback_url: callbackUrl }
    );
    return response.data;
  },

  // Usage and metrics (v2 endpoints)
  getMetrics: async () => {
    const response = await apiClient.get<MetricsResponse>("/admin/v2/portal/me/metrics");
    return response.data;
  },

  getUsageSummary: async (params?: ApiUsageQueryParams) => {
    const response = await apiClient.get<ApiUsageSummary>("/admin/v2/portal/me/usage/summary", {
      params,
    });
    return response.data;
  },

  // Get usage summary for a specific portal (Super Admin)
  getPortalUsageSummary: async (portalId: string, params?: ApiUsageQueryParams) => {
    const response = await apiClient.get<ApiUsageSummary>(
      `/admin/v2/super/portals/${portalId}/usage/summary`,
      { params }
    );
    return response.data;
  },

  getMyUsage: async (params?: ApiUsageQueryParams) => {
    const response = await apiClient.get<PaginatedResponse<ApiUsageRecord>>(
      "/admin/v2/portal/me/usage",
      { params }
    );
    return response.data;
  },

  getKeyUsage: async (keyId: string, params?: ApiUsageQueryParams) => {
    const response = await apiClient.get<PaginatedResponse<ApiUsageRecord>>(
      `/admin/v2/portal/me/keys/${keyId}/usage`,
      { params }
    );
    return response.data;
  },

  // Super Admin: Get usage for any portal
  getPortalUsage: async (portalId: string, params?: ApiUsageQueryParams) => {
    const response = await apiClient.get<PaginatedResponse<ApiUsageRecord>>(
      `/admin/v2/super/portals/${portalId}/usage`,
      { params }
    );
    return response.data;
  },

  // Super Admin: Get usage for a specific API key
  getPortalKeyUsage: async (portalId: string, keyId: string, params?: ApiUsageQueryParams) => {
    const response = await apiClient.get<PaginatedResponse<ApiUsageRecord>>(
      `/admin/v2/super/portals/${portalId}/keys/${keyId}/usage`,
      { params }
    );
    return response.data;
  },
};
