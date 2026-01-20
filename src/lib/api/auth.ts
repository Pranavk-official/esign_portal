import { apiClient } from './client';
import { OTPRequestForm, OTPVerifyForm } from '@/lib/schemas/auth';
import { AuthResponse, OTPRequestResponse, UserDetailResponse } from './types';

export const authApi = {
  requestOTP: async (data: OTPRequestForm) => {
    const response = await apiClient.post<OTPRequestResponse>('/admin/auth/request-otp', data);
    return response.data;
  },

  verifyOTP: async (data: OTPVerifyForm) => {
    const response = await apiClient.post<AuthResponse>('/admin/auth/verify-otp', data);
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get<UserDetailResponse>('/users/me');
    return response.data;
  },

  logout: async (data?: { refresh_token?: string; revoke_all?: boolean }) => {
    const response = await apiClient.post('/admin/auth/logout', data || { revoke_all: true });
    return response.data;
  }
};
