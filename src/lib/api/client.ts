/**
 * API Client Configuration
 *
 * Axios client with cookie-based authentication and cross-origin support.
 *
 * Key Features:
 * - Automatic cookie handling with `withCredentials: true`
 * - Automatic token refresh on 401 errors
 * - Custom error translation (HTTP status → AppError subclasses)
 * - Event-based session expiry (no hard `window.location` redirect)
 *
 * Authentication Flow:
 * 1. Login → backend sets HttpOnly cookies (access_token, refresh_token)
 * 2. Browser auto-sends cookies with every request
 * 3. On 401 → automatically POST /admin/auth/refresh (cookie-based)
 * 4. On refresh failure → emit "auth:session-expired" event
 *    (handled by QueryProvider to clear state + redirect via Next.js router)
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

// ─── Session Expiry Callback ────────────────────────────────
// Registered by QueryProvider so that the interceptor can trigger
// cleanup (clear store, clear cache, router.push) inside React context.

type SessionExpiredCallback = () => void;
let onSessionExpired: SessionExpiredCallback | null = null;

export function setOnSessionExpired(cb: SessionExpiredCallback) {
  onSessionExpired = cb;
}

// ─── Axios Instance ─────────────────────────────────────────

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(
  /\/$/,
  ""
);

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true,
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

    // B. 401 → attempt token refresh (once per request)
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post(
          `${BASE_URL}/admin/auth/refresh`,
          {},
          { withCredentials: true, timeout: 10000 }
        );

        // Retry the original request with the fresh cookie
        return apiClient(originalRequest);
      } catch {
        // Refresh failed — session is dead.
        // Delegate cleanup to React-land via the registered callback
        // (clears Zustand, clears React Query cache, router.push to /login)
        onSessionExpired?.();

        return Promise.reject(new UnauthorizedError("Session expired. Please login again."));
      }
    }

    // C. Map HTTP status → typed AppError subclass
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
      case 422:
        customError = new BadRequestError(messageStr);
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
