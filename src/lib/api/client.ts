/**
 * API Client Configuration
 *
 * This module sets up the Axios client for cookie-based authentication with
 * cross-origin support. All requests are routed through the Next.js API proxy
 * at /api/[...path] to avoid cross-origin cookie issues.
 *
 * Key Features:
 * - Automatic cookie handling with `withCredentials: true`
 * - Automatic token refresh on 401 errors
 * - Custom error translation (HTTP status → AppError subclasses)
 * - Network error handling
 *
 * Authentication Flow:
 * 1. Login sets HttpOnly cookies (access_token, refresh_token)
 * 2. Browser automatically sends cookies with each request (same-origin via proxy)
 * 3. On 401, automatically refreshes using the refresh_token cookie
 * 4. On refresh failure, clears auth state and redirects to login
 *
 * Configuration:
 * - Update BACKEND_URL in .env.local when the backend URL changes (server-only var)
 * - The proxy at src/app/api/[...path]/route.ts handles forwarding to the backend
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/lib/stores/auth-store";

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

// ─── Axios Instance ─────────────────────────────────────────

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// All requests go through the Next.js API proxy (same-origin) so cookies are
// sent automatically without any cross-origin restrictions.
const BASE_URL = "/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true, // CRITICAL: sends cookies with every request
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Response Interceptor ───────────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // A. Network errors (no response at all)
    if (!error.response) {
      return Promise.reject(new InternalServerError("Network Error: Unable to reach the server."));
    }

    const status = error.response.status;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = error.response.data as any;
    const message: string = data?.detail || data?.message || "An unexpected error occurred";

    // B. 401 → attempt token refresh (once per request)
    // The browser sends the HttpOnly refresh_token cookie automatically;
    // the body can be omitted since the backend reads the token from the cookie.
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // POST with empty body — backend reads refresh_token from HttpOnly cookie.
        await axios.post(`${BASE_URL}/admin/auth/refresh`, {}, {
          withCredentials: true,
          timeout: 10000,
        });

        // Retry the original request — browser will send the new access_token cookie.
        return apiClient(originalRequest);
      } catch {
        // Refresh failed — session is dead.
        // Clear auth state and redirect to login directly from the interceptor.
        useAuthStore.getState().clearAuth();

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(new UnauthorizedError("Session expired. Please login again."));
      }
    }

    // C. Map HTTP status → typed AppError subclass
    let customError: AppError;

    switch (status) {
      case 400:
        customError = new BadRequestError(message);
        break;
      case 401:
        customError = new UnauthorizedError(message);
        break;
      case 403:
        customError = new ForbiddenError(message);
        break;
      case 404:
        customError = new NotFoundError(message);
        break;
      case 409:
        customError = new ConflictError(message);
        break;
      case 422:
        customError = new BadRequestError(message);
        break;
      case 429:
        customError = new TooManyRequestsError(message);
        break;
      case 500:
      default:
        customError = new InternalServerError(message);
        break;
    }

    return Promise.reject(customError);
  }
);
