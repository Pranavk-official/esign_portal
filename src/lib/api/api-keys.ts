import { apiClient } from "./client";
import {
  ApiKeyGenerateResponse,
  ApiKeyQueryParams,
  ApiKeyResponse,
  PaginatedResponse,
} from "./types";
import { ApiKeyGenerateRequest } from "../schemas/api-key";

export interface CallbackUrlUpdate {
  callback_url: string | null;
}

export const apiKeysApi = {
  listMyKeys: async (params?: ApiKeyQueryParams) => {
    const response = await apiClient.get<PaginatedResponse<ApiKeyResponse>>(
      "/admin/portals/me/keys",
      { params }
    );
    return response.data;
  },

  generateKey: async (data: ApiKeyGenerateRequest) => {
    const response = await apiClient.post<ApiKeyGenerateResponse>(
      "/admin/portals/me/generate-key",
      data
    );
    return response.data;
  },

  revokeKey: async (keyId: string, reason?: string) => {
    const response = await apiClient.post(`/admin/portals/me/keys/${keyId}/revoke`, {
      reason,
      is_active: false,
    });
    return response.data;
  },

  updateCallback: async (keyId: string, callbackUrl: string | null) => {
    const response = await apiClient.put<ApiKeyResponse>(
      `/admin/portals/me/keys/${keyId}/callback`,
      { callback_url: callbackUrl }
    );
    return response.data;
  },
};
