import { apiClient } from "./client";
import { ApiUsageQueryParams, ApiUsageRecord, ApiUsageSummary, PaginatedResponse } from "./types";

export { type ApiUsageRecord };

export const usageApi = {
  // Admin: Get all API usage across system
  listAll: async (params?: ApiUsageQueryParams) => {
    const response = await apiClient.get<PaginatedResponse<ApiUsageRecord>>("/admin/api-usage", {
      params,
    });
    return response.data;
  },

  // Admin: Get usage summary
  getSummary: async (
    params?: Omit<ApiUsageQueryParams, "page" | "page_size" | "sort_by" | "sort_order" | "search">
  ) => {
    const response = await apiClient.get<ApiUsageSummary>("/admin/api-usage/summary", { params });
    return response.data;
  },

  // Admin: Get usage for specific portal
  listByPortal: async (portalId: string, params?: ApiUsageQueryParams) => {
    const response = await apiClient.get<PaginatedResponse<ApiUsageRecord>>(
      `/admin/portals/${portalId}/usage`,
      { params }
    );
    return response.data;
  },

  // Admin: Get usage for specific API key
  listByApiKey: async (portalId: string, keyId: string, params?: ApiUsageQueryParams) => {
    const response = await apiClient.get<PaginatedResponse<ApiUsageRecord>>(
      `/admin/portals/${portalId}/keys/${keyId}/usage`,
      { params }
    );
    return response.data;
  },
};
