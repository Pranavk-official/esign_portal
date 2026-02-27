import { apiClient } from "./client";
import { ApiUsageQueryParams, ApiUsageRecord, ApiUsageSummary, PaginatedResponse } from "./types";

export { type ApiUsageRecord };

export const usageApi = {
  // Super Admin: Get all API usage across system (v2)
  listAll: async (params?: ApiUsageQueryParams) => {
    const response = await apiClient.get<PaginatedResponse<ApiUsageRecord>>(
      "/admin/v2/super/usage",
      { params }
    );
    return response.data;
  },

  // Super Admin: Get usage summary (v2)
  getSummary: async (
    params?: Omit<ApiUsageQueryParams, "page" | "page_size" | "sort_by" | "sort_order" | "search">
  ) => {
    const response = await apiClient.get<ApiUsageSummary>("/admin/v2/super/usage/summary", {
      params,
    });
    return response.data;
  },

  // Super Admin: Get usage for a specific portal (v2)
  listByPortal: async (portalId: string, params?: ApiUsageQueryParams) => {
    const response = await apiClient.get<PaginatedResponse<ApiUsageRecord>>(
      `/admin/v2/super/portals/${portalId}/usage`,
      { params }
    );
    return response.data;
  },

  // Super Admin: Get usage for a specific API key (v2)
  listByApiKey: async (portalId: string, keyId: string, params?: ApiUsageQueryParams) => {
    const response = await apiClient.get<PaginatedResponse<ApiUsageRecord>>(
      `/admin/v2/super/portals/${portalId}/keys/${keyId}/usage`,
      { params }
    );
    return response.data;
  },
};
