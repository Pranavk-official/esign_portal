import { ApiKeyGenerateRequest } from "../schemas/api-key";
import { apiClient } from "./client";
import {
  ApiKeyGenerateResponse,
  ApiKeyQueryParams,
  ApiKeyResponse,
  PaginatedResponse,
} from "./types";

export interface CallbackUrlUpdate {
  callback_url: string | null;
}

export const apiKeysApi = {
  listMyKeys: async (params?: ApiKeyQueryParams) => {
    // v2: GET /admin/v2/portal/me/keys
    const response = await apiClient.get<PaginatedResponse<ApiKeyResponse>>(
      "/admin/v2/portal/me/keys",
      { params }
    );
    return response.data;
  },

  generateKey: async (data: ApiKeyGenerateRequest) => {
    // v2: POST /admin/v2/portal/me/keys (was /admin/portals/me/generate-key)
    const response = await apiClient.post<ApiKeyGenerateResponse>(
      "/admin/v2/portal/me/keys",
      data
    );
    return response.data;
  },

  revokeKey: async (keyId: string, reason?: string) => {
    // No dedicated revoke endpoint in v2 — revocation is handled by super admin
    const response = await apiClient.post(`/admin/portals/me/keys/${keyId}/revoke`, {
      reason,
      is_active: false,
    });
    return response.data;
  },

  updateCallback: async (keyId: string, callbackUrl: string | null) => {
    // v2: PUT /admin/v2/portal/me/keys/{key_id}/callback
    const response = await apiClient.put<ApiKeyResponse>(
      `/admin/v2/portal/me/keys/${keyId}/callback`,
      { callback_url: callbackUrl }
    );
    return response.data;
  },
};
