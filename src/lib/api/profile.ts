import { apiClient } from './client';

export interface UserProfile {
    id: string;
    email: string;
    portal_id: string | null;
    is_active: boolean;
    created_at: string;
    roles: Array<{
        id: string;
        name: string;
        description: string | null;
    }>;
}

export interface UpdateProfileRequest {
    email?: string;
}

export interface UserActivity {
    id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    timestamp: string;
    details?: Record<string, any>;
}

export const profileApi = {
    getProfile: async () => {
        const response = await apiClient.get<UserProfile>('/users/me');
        return response.data;
    },

    updateProfile: async (data: UpdateProfileRequest) => {
        const response = await apiClient.patch<UserProfile>('/users/me', data);
        return response.data;
    },

    getActivity: async () => {
        const response = await apiClient.get<UserActivity[]>('/users/me/activity');
        return response.data;
    },
};
