import { apiClient } from "./client";
import {
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

export interface PortalStatusUpdateRequest {
  is_active: boolean;
  reason?: string;
}

export interface PortalKeyLimitUpdate {
  max_keys?: number | null;
}

export interface ApiKeyStatusUpdateRequest {
  is_active: boolean;
  reason?: string;
}

export interface ApiKeyTxnCountUpdateRequest {
  max_txn_count?: number | null;
  max_txn_count_threshold?: number | null;
}

export const portalsApi = {
  // List and get operations
  listAll: async (params?: PortalQueryParams) => {
    const response = await apiClient.get<PaginatedResponse<PortalListResponse>>("/admin/portals", {
      params,
    });
    return response.data;
  },

  get: async (portalId: string) => {
    const response = await apiClient.get<PortalListResponse>(`/admin/portals/${portalId}`);
    return response.data;
  },

  onboard: async (data: PortalOnboardingRequest) => {
    const response = await apiClient.post<PortalResponse>("/admin/portals/onboard", data);
    return response.data;
  },

  getMyPortal: async () => {
    const response = await apiClient.get<PortalResponse>("/admin/portals/me");
    return response.data;
  },

  // Portal management operations - Admin only
  updateStatus: async (portalId: string, data: PortalStatusUpdateRequest) => {
    const response = await apiClient.patch<PortalListResponse>(
      `/admin/portals/${portalId}/status`,
      data
    );
    return response.data;
  },

  updateKeyLimits: async (portalId: string, data: PortalKeyLimitUpdate) => {
    const response = await apiClient.patch<PortalResponse>(
      `/admin/portals/${portalId}/key-limits`,
      data
    );
    return response.data;
  },

  // API Keys for portal - Admin only
  listPortalKeys: async (portalId: string, params?: any) => {
    const response = await apiClient.get<PaginatedResponse<ApiKeyResponse>>(
      `/admin/portals/${portalId}/keys`,
      { params }
    );
    return response.data;
  },

  updateKeyStatus: async (portalId: string, keyId: string, data: ApiKeyStatusUpdateRequest) => {
    const response = await apiClient.patch(`/admin/portals/${portalId}/keys/${keyId}/status`, data);
    return response.data;
  },

  updateKeyTxnCount: async (portalId: string, keyId: string, data: ApiKeyTxnCountUpdateRequest) => {
    const response = await apiClient.patch(
      `/admin/portals/${portalId}/keys/${keyId}/txn-count`,
      data
    );
    return response.data;
  },

  // Usage and metrics
  getMetrics: async () => {
    const response = await apiClient.get<MetricsResponse>("/admin/portals/me/metrics");
    return response.data;
  },

  getUsageSummary: async (params?: ApiUsageQueryParams) => {
    const response = await apiClient.get<ApiUsageSummary>("/admin/portals/me/usage/summary", {
      params,
    });
    return response.data;
  },

  getMyUsage: async (params?: ApiUsageQueryParams) => {
    const response = await apiClient.get<PaginatedResponse<ApiUsageRecord>>(
      "/admin/portals/me/usage",
      { params }
    );
    return response.data;
  },

  getKeyUsage: async (keyId: string, params?: ApiUsageQueryParams) => {
    const response = await apiClient.get<PaginatedResponse<ApiUsageRecord>>(
      `/admin/portals/me/keys/${keyId}/usage`,
      { params }
    );
    return response.data;
  },

  // Admin: Get usage for any portal
  getPortalUsage: async (portalId: string, params?: ApiUsageQueryParams) => {
    const response = await apiClient.get<PaginatedResponse<ApiUsageRecord>>(
      `/admin/portals/${portalId}/usage`,
      { params }
    );
    return response.data;
  },

  getPortalKeyUsage: async (portalId: string, keyId: string, params?: ApiUsageQueryParams) => {
    const response = await apiClient.get<PaginatedResponse<ApiUsageRecord>>(
      `/admin/portals/${portalId}/keys/${keyId}/usage`,
      { params }
    );
    return response.data;
  },
};
