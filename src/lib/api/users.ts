import { apiClient } from './client';
import { UserListResponse, UserDetailResponse, PaginatedResponse, UserQueryParams } from './types';
import { UserCreateRequest, UserUpdateRequest } from '@/types/user';

export interface BulkCreateUsersRequest {
    users: UserCreateRequest[];
}

export interface BulkCreateUsersResponse {
    created: UserDetailResponse[];
    failed: Array<{ email: string; error: string }>;
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
        const response = await apiClient.get<PaginatedResponse<UserListResponse>>('/admin/users', { params });
        return response.data;
    },

    listByPortal: async (portalId: string, params?: UserQueryParams) => {
        const response = await apiClient.get<PaginatedResponse<UserListResponse>>(`/admin/portals/${portalId}/users`, { params });
        return response.data;
    },

    // Portal Manager: List users in their portal
    listMyUsers: async (params?: UserQueryParams) => {
        const response = await apiClient.get<PaginatedResponse<UserListResponse>>('/admin/portals/me/users', { params });
        return response.data;
    },

    // CRUD operations - Admin
    create: async (data: UserCreateRequest) => {
        const response = await apiClient.post<UserDetailResponse>('/admin/users', data);
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
        const response = await apiClient.post<UserDetailResponse>(`/admin/users/${userId}/roles`, { role_names: roleNames });
        return response.data;
    },

    removeRoles: async (userId: string, roleNames: string[]) => {
        const response = await apiClient.delete<UserDetailResponse>(`/admin/users/${userId}/roles`, { data: { role_names: roleNames } });
        return response.data;
    },

    // Bulk operations - Admin
    bulkCreate: async (users: UserCreateRequest[]) => {
        const response = await apiClient.post<BulkCreateUsersResponse>('/admin/users/bulk-create', { users });
        return response.data;
    },

    bulkAssignRoles: async (userIds: string[], roleNames: string[]) => {
        const response = await apiClient.post('/admin/users/bulk-assign-roles', { user_ids: userIds, role_names: roleNames });
        return response.data;
    },

    bulkDeactivate: async (userIds: string[]) => {
        const response = await apiClient.post('/admin/users/bulk-deactivate', { user_ids: userIds });
        return response.data;
    },

    // Portal Manager: CRUD operations for their portal
    createInMyPortal: async (data: Omit<UserCreateRequest, 'portal_id'>) => {
        const response = await apiClient.post<UserDetailResponse>('/admin/portals/me/users', data);
        return response.data;
    },

    getFromMyPortal: async (userId: string) => {
        const response = await apiClient.get<UserDetailResponse>(`/admin/portals/me/users/${userId}`);
        return response.data;
    },

    updateInMyPortal: async (userId: string, data: UserUpdateRequest) => {
        const response = await apiClient.patch<UserDetailResponse>(`/admin/portals/me/users/${userId}`, data);
        return response.data;
    },

    activateInMyPortal: async (userId: string) => {
        const response = await apiClient.post<UserDetailResponse>(`/admin/portals/me/users/${userId}/activate`);
        return response.data;
    },

    deactivateInMyPortal: async (userId: string) => {
        const response = await apiClient.post<UserDetailResponse>(`/admin/portals/me/users/${userId}/deactivate`);
        return response.data;
    },
};
