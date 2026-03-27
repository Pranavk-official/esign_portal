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
 * - Update BACKEND_URL in .env.local when the backend URL changes
 * - Backend must have CORS configured with allow_credentials=True
 * - Backend must set cookies with secure=True, httponly=True, samesite=none
 * 
 * Debugging:
 * - In browser console: `authDebug.diagnose()` for full diagnostic
 * - See COOKIE_AUTH_SETUP.md for troubleshooting guide
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

import {
  AppError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError} from '@/lib/errors';
import { useAuthStore } from '@/lib/stores/auth-store';

// Extend Axios config for retry flag
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Base URL uses our new Next.js API proxy to avoid cross-origin cookie issues
const BASE_URL = '/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true, // CRITICAL: Sends cookies with requests for cross-origin auth
  headers: {
    'Content-Type': 'application/json',
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
    const data = error.response.data as any;
    const message = data?.detail || data?.message || "An unexpected error occurred";

    // B. Handle 401 Token Refresh Logic (Cookie-based)
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
        // Refresh failed — clear auth state and send user back to login.
        useAuthStore.getState().clearAuth();

        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }

        return Promise.reject(new UnauthorizedError('Session expired. Please login again.'));
      }
    }

    // C. Map HTTP Status to Custom Error Classes
    let customError: AppError;

    switch (status) {
      case 400: customError = new BadRequestError(message); break;
      case 401: customError = new UnauthorizedError(message); break;
      case 403: customError = new ForbiddenError(message); break;
      case 404: customError = new NotFoundError(message); break;
      case 409: customError = new ConflictError(message); break;
      case 429: customError = new TooManyRequestsError(message); break;
      case 500: default: customError = new InternalServerError(message); break;
    }

    return Promise.reject(customError);
  }
);
