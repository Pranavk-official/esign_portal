import { apiClient } from './client';
import { OTPRequestForm, OTPVerifyForm } from '@/lib/schemas/auth';
import { UserInfo } from '@/lib/stores/auth-store';

// Mock delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authApi = {
  requestOTP: async (data: OTPRequestForm & { scope: 'LOGIN' }) => {
    // MOCK: Simulate API call
    await delay(1000);
    console.log('[MOCK] Requested OTP for:', data.email);
    
    // Validate email for mock
    const validEmails = ['super@admin.com', 'portal@admin.com', 'user@demo.com'];
    if (!validEmails.includes(data.email)) {
        throw { response: { data: { message: "User not found" } } };
    }

    return { data: { message: 'OTP sent successfully' } };
    // return apiClient.post('/admin/auth/request-otp', data);
  },

  verifyOTP: async (data: OTPVerifyForm & { scope: 'LOGIN' }) => {
    // MOCK: Simulate API call
    await delay(1000);
    console.log('[MOCK] Verified OTP:', data.otp);
    
    if (data.otp !== '123456') {
        throw { response: { data: { message: "Invalid OTP" } } };
    }

    // Store the email in localStorage to simulate session for getMe
    if (typeof window !== 'undefined') {
        localStorage.setItem('mock_session_email', data.email);
    }

    // We ignore the response body (Token) because we rely on the HttpOnly cookie.
    return { data: { message: 'Login successful' } };
    // return apiClient.post('/admin/auth/verify-otp', data);
  },

  // NEW: Fetch profile immediately after verification
  getMe: async () => {
    // MOCK: Simulate API call
    await delay(500);
    
    let email = 'super@admin.com';
    if (typeof window !== 'undefined') {
        email = localStorage.getItem('mock_session_email') || email;
    }

    let role = 'SUPER_ADMIN';
    let portalId = null;

    if (email === 'portal@admin.com') {
        role = 'PORTAL_ADMIN';
        portalId = 'mock-portal-1';
    } else if (email === 'user@demo.com') {
        role = 'USER';
        portalId = 'mock-portal-1';
    }

    return {
      data: {
        id: 'mock-user-id',
        email: email,
        portal_id: portalId,
        is_active: true,
        roles: [role] 
      } as UserInfo
    };
    // return apiClient.get<UserInfo>('/users/me');
  },

  logout: async () => {
    await delay(500);
    if (typeof window !== 'undefined') {
        localStorage.removeItem('mock_session_email');
    }
    return { data: { message: 'Logged out' } };
    // return apiClient.post('/admin/auth/logout');
  }
};
