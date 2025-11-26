import { apiClient } from './client';
import { OTPRequestForm, OTPVerifyForm } from '@/lib/schemas/auth';
import { UserInfo } from '@/lib/stores/auth-store';

export const authApi = {
  requestOTP: async (data: OTPRequestForm & { scope: 'LOGIN' }) => {
    return apiClient.post('/admin/auth/request-otp', data);
  },

  verifyOTP: async (data: OTPVerifyForm & { scope: 'LOGIN' }) => {
    // We ignore the response body (Token) because we rely on the HttpOnly cookie.
    return apiClient.post('/admin/auth/verify-otp', data);
  },

  // NEW: Fetch profile immediately after verification
  getMe: async () => {
    return apiClient.get<UserInfo>('/users/me');
  },

  logout: async () => {
    return apiClient.post('/admin/auth/logout');
  }
};
