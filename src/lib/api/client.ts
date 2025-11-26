import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
  InternalServerError,
  AppError
} from '@/lib/errors';

// Extend Axios config for retry flag
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true, // <--- CRITICAL: Sends cookies with requests
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

    // B. Handle 401 Token Refresh Logic (Cookie Based)
    const originalRequest = error.config as CustomAxiosRequestConfig;
    
    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // We just call the endpoint. The browser sends the HttpOnly 'refresh_token' cookie.
        // The backend validates it and sets a new 'access_token' cookie in the response.
        await axios.post(`${BASE_URL}/admin/auth/refresh`, {}, { withCredentials: true });
        
        // Retry original request (Browser will attach new access cookie)
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear client state
        useAuthStore.getState().clearAuth();
        // Redirect is handled by the UI/Middleware
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
