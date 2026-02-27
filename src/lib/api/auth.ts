import { apiClient } from './client';
import { OTPRequestForm, OTPVerifyForm } from '@/lib/schemas/auth';

// ─── Request / Response Types (aligned with openapi.json) ─────────────────────

/** POST /admin/auth/request-otp */
export interface OTPRequestPayload {
  email: string;
  scope: 'LOGIN' | 'RESET_PASSWORD';
}

/** OTPRequestResponse */
export interface OTPRequestResponse {
  message: string;
}

/** POST /admin/auth/verify-otp */
export interface OTPVerifyPayload {
  email: string;
  otp: string;
  scope: 'LOGIN' | 'RESET_PASSWORD';
}

/** RoleResponse (from openapi.json #/components/schemas/RoleResponse) */
export interface RoleResponse {
  id: string;
  name: string;
  description?: string | null;
}

/** UserDetailResponse (from openapi.json #/components/schemas/UserDetailResponse) */
export interface UserDetailResponse {
  id: string;
  email: string;
  portal_id: string | null;
  is_active: boolean;
  created_at: string;
  roles: RoleResponse[];
}

/** AuthResponse (from openapi.json #/components/schemas/AuthResponse) */
export interface AuthResponse {
  message: string;
  token_type: string;
  user: UserDetailResponse | null;
}

/** LogoutRequest (from openapi.json #/components/schemas/LogoutRequest) */
export interface LogoutRequestPayload {
  refresh_token?: string | null;
  revoke_all?: boolean;
}

/** LogoutResponse (from openapi.json #/components/schemas/LogoutResponse) */
export interface LogoutResponse {
  message: string;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  /**
   * Request OTP for login.
   * POST /admin/auth/request-otp
   */
  requestOTP: async (data: OTPRequestForm & { scope: 'LOGIN' }): Promise<OTPRequestResponse> => {
    const payload: OTPRequestPayload = {
      email: data.email,
      scope: data.scope,
    };
    const response = await apiClient.post<OTPRequestResponse>('/admin/auth/request-otp', payload);
    return response.data;
  },

  /**
   * Verify OTP and complete login. Backend sets HttpOnly auth cookies in response.
   * POST /admin/auth/verify-otp
   */
  verifyOTP: async (data: OTPVerifyForm & { scope: 'LOGIN' }): Promise<AuthResponse> => {
    const payload: OTPVerifyPayload = {
      email: data.email,
      otp: data.otp,
      scope: data.scope,
    };
    const response = await apiClient.post<AuthResponse>('/admin/auth/verify-otp', payload);
    return response.data;
  },

  /**
   * Get the currently authenticated user's profile.
   * GET /users/me
   */
  getMe: async (): Promise<UserDetailResponse> => {
    const response = await apiClient.get<UserDetailResponse>('/users/me');
    return response.data;
  },

  /**
   * Logout user by revoking all refresh tokens.
   * POST /admin/auth/logout
   */
  logout: async (): Promise<LogoutResponse> => {
    const payload: LogoutRequestPayload = { revoke_all: true };
    const response = await apiClient.post<LogoutResponse>('/admin/auth/logout', payload);
    return response.data;
  },
};
