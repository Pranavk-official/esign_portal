import type { UserDetailResponse } from "@/lib/api/auth";
import { PortalAdminUserCreateRequest, UserCreateRequest, UserUpdateRequest } from "@/lib/schemas/user";

import { apiClient } from "./client";
import { PaginatedResponse, UserListResponse, UserQueryParams } from "./types";

export interface BulkCreateUsersRequest {
  users: UserCreateRequest[];
}

/** Matches backend BulkOperationResult schema */
export interface BulkOperationResponse {
  success_count: number;
  failure_count: number;
  errors: Array<{ index?: number; email?: string; user_id?: string; error: string }>;
}

export interface BulkAssignRolesRequest {
  user_ids: string[];
  role_names: string[];
}

export interface BulkDeactivateUsersRequest {
  user_ids: string[];
}

export const usersApi = {
  // List operations
  listAll: async (params?: UserQueryParams) => {
    const response = await apiClient.get<PaginatedResponse<UserListResponse>>("/admin/users", {
      params,
    });
    return response.data;
  },

  // Super Admin: List users for a specific portal (v2)
  listByPortal: async (portalId: string, params?: UserQueryParams) => {
    const response = await apiClient.get<PaginatedResponse<UserListResponse>>(
      `/admin/v2/super/portals/${portalId}/users`,
      { params }
    );
    return response.data;
  },

  // Portal Admin: List users in their own portal (v2)
  listMyUsers: async (params?: UserQueryParams) => {
    const response = await apiClient.get<PaginatedResponse<UserListResponse>>(
      "/admin/v2/portal/me/users",
      { params }
    );
    return response.data;
  },

  // CRUD operations - Admin
  create: async (data: UserCreateRequest) => {
    const response = await apiClient.post<UserDetailResponse>("/admin/users", data);
    return response.data;
  },

  get: async (userId: string) => {
    const response = await apiClient.get<UserDetailResponse>(`/admin/users/${userId}`);
    return response.data;
  },

  update: async (userId: string, data: UserUpdateRequest) => {
    const response = await apiClient.patch<UserDetailResponse>(`/admin/users/${userId}`, data);
    return response.data;
  },

  // Activation/Deactivation - Admin
  activate: async (userId: string) => {
    const response = await apiClient.post<UserDetailResponse>(`/admin/users/${userId}/activate`);
    return response.data;
  },

  deactivate: async (userId: string) => {
    const response = await apiClient.post<UserDetailResponse>(`/admin/users/${userId}/deactivate`);
    return response.data;
  },

  // Role management - Admin
  assignRoles: async (userId: string, roleNames: string[]) => {
    const response = await apiClient.post<UserDetailResponse>(`/admin/users/${userId}/roles`, {
      role_names: roleNames,
    });
    return response.data;
  },

  removeRoles: async (userId: string, roleNames: string[]) => {
    const response = await apiClient.delete<UserDetailResponse>(`/admin/users/${userId}/roles`, {
      data: { role_names: roleNames },
    });
    return response.data;
  },

  // Bulk operations - Admin
  bulkCreate: async (users: UserCreateRequest[]) => {
    const response = await apiClient.post<BulkOperationResponse>("/admin/users/bulk-create", {
      users,
    });
    return response.data;
  },

  bulkAssignRoles: async (userIds: string[], roleNames: string[]) => {
    const response = await apiClient.post<BulkOperationResponse>("/admin/users/bulk-assign-roles", {
      user_ids: userIds,
      role_names: roleNames,
    });
    return response.data;
  },

  bulkDeactivate: async (userIds: string[]) => {
    const response = await apiClient.post<BulkOperationResponse>("/admin/users/bulk-deactivate", { user_ids: userIds });
    return response.data;
  },

  // Portal Admin: CRUD operations scoped to their own portal (v2)
  createInMyPortal: async (data: PortalAdminUserCreateRequest) => {
    const response = await apiClient.post<UserDetailResponse>("/admin/v2/portal/me/users", data);
    return response.data;
  },

  getFromMyPortal: async (userId: string) => {
    const response = await apiClient.get<UserDetailResponse>(`/admin/v2/portal/me/users/${userId}`);
    return response.data;
  },

  updateInMyPortal: async (userId: string, data: UserUpdateRequest) => {
    const response = await apiClient.patch<UserDetailResponse>(
      `/admin/v2/portal/me/users/${userId}`,
      data
    );
    return response.data;
  },

  activateInMyPortal: async (userId: string) => {
    const response = await apiClient.post<UserDetailResponse>(
      `/admin/v2/portal/me/users/${userId}/activate`
    );
    return response.data;
  },

  deactivateInMyPortal: async (userId: string) => {
    const response = await apiClient.post<UserDetailResponse>(
      `/admin/v2/portal/me/users/${userId}/deactivate`
    );
    return response.data;
  },
};
