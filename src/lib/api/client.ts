/**
 * API Client Configuration
 *
 * This module sets up the Axios client for cookie-based authentication with cross-origin support.
 *
 * Key Features:
 * - Automatic cookie handling with `withCredentials: true`
 * - Automatic token refresh on 401 errors
 * - Custom error translation
 * - Network error handling
 *
 * Authentication Flow:
 * 1. Login sets HttpOnly cookies (access_token, refresh_token)
 * 2. Browser automatically sends cookies with each request
 * 3. On 401, automatically refreshes using refresh_token cookie
 * 4. On refresh failure, clears auth state and redirects to login
 *
 * Configuration:
 * - Update NEXT_PUBLIC_API_BASE_URL in .env.local when dev tunnel URL changes
 * - Backend must have CORS configured with allow_credentials=True
 * - Backend must set cookies with secure=True, httponly=True, samesite=none
 *
 * Debugging:
 * - In browser console: `authDebug.diagnose()` for full diagnostic
 * - See COOKIE_AUTH_SETUP.md for troubleshooting guide
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import {
  AppError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
} from "@/lib/errors";
import { useAuthStore } from "@/lib/stores/auth-store";

// Extend Axios config for retry flag
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Remove trailing slash if present
const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(
  /\/$/,
  ""
);

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true, // CRITICAL: Sends cookies with requests for cross-origin auth
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: (REMOVED Authorization Header injection)
// Cookies are handled automatically by the browser.

// Response Interceptor: Error Translation & Refresh Logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // A. Handle Network Errors
    if (!error.response) {
      return Promise.reject(new InternalServerError("Network Error: Unable to reach the server."));
    }

    const status = error.response.status;
    const data = error.response.data as unknown;
    const message =
      (typeof data === "object" && data !== null && "detail" in data
        ? (data as Record<string, unknown>).detail
        : null) ||
      (typeof data === "object" && data !== null && "message" in data
        ? (data as Record<string, unknown>).message
        : null) ||
      "An unexpected error occurred";
    const messageStr = typeof message === "string" ? message : String(message);

    // B. Handle 401 Token Refresh Logic (Cookie Based)
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh endpoint with withCredentials to send HttpOnly refresh_token cookie
        // Backend validates it and sets a new access_token cookie in the response
        await axios.post(
          `${BASE_URL}/admin/auth/refresh`,
          {},
          {
            withCredentials: true,
            timeout: 10000, // Shorter timeout for refresh attempts
          }
        );

        // Retry original request - browser will automatically attach the new access_token cookie
        return apiClient(originalRequest);
      } catch {
        // Refresh failed - clear auth state and redirect to login
        useAuthStore.getState().clearAuth();

        // Only redirect on client side
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(new UnauthorizedError("Session expired. Please login again."));
      }
    }

    // C. Map HTTP Status to Custom Error Classes
    let customError: AppError;

    switch (status) {
      case 400:
        customError = new BadRequestError(messageStr);
        break;
      case 401:
        customError = new UnauthorizedError(messageStr);
        break;
      case 403:
        customError = new ForbiddenError(messageStr);
        break;
      case 404:
        customError = new NotFoundError(messageStr);
        break;
      case 409:
        customError = new ConflictError(messageStr);
        break;
      case 429:
        customError = new TooManyRequestsError(messageStr);
        break;
      case 500:
      default:
        customError = new InternalServerError(messageStr);
        break;
    }

    return Promise.reject(customError);
  }
);
