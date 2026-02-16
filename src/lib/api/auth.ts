import type {
  AuthResponse,
  LogoutResponse,
  OTPRequestForm,
  OTPRequestResponse,
  OTPVerifyForm,
  UserDetailResponse,
} from "@/lib/schemas/auth";
import {
  authResponseSchema,
  logoutResponseSchema,
  otpRequestResponseSchema,
  userDetailSchema,
} from "@/lib/schemas/auth";

import { apiClient } from "./client";

/**
 * Auth API — every response is runtime-validated through Zod schemas.
 *
 * This catches backend contract drift at the boundary instead of letting
 * malformed data propagate into the app.
 */
export const authApi = {
  /** Send OTP to the user's email address */
  requestOTP: async (data: OTPRequestForm): Promise<OTPRequestResponse> => {
    const response = await apiClient.post("/admin/auth/request-otp", data);
    return otpRequestResponseSchema.parse(response.data);
  },

  /** Verify OTP and establish session (backend sets HttpOnly cookies) */
  verifyOTP: async (data: OTPVerifyForm): Promise<AuthResponse> => {
    const response = await apiClient.post("/admin/auth/verify-otp", data);
    return authResponseSchema.parse(response.data);
  },

  /** Fetch the currently authenticated user profile */
  getMe: async (): Promise<UserDetailResponse> => {
    const response = await apiClient.get("/users/me");
    return userDetailSchema.parse(response.data);
  },

  /** Logout — revoke all tokens and clear HttpOnly cookies */
  logout: async (): Promise<LogoutResponse> => {
    const response = await apiClient.post("/admin/auth/logout", { revoke_all: true });
    return logoutResponseSchema.parse(response.data);
  },
};
