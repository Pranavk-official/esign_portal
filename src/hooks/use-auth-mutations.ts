import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { authApi } from "@/lib/api/auth";
import { authKeys } from "@/lib/auth/query-keys";
import { getRedirectPath } from "@/lib/auth/roles";
import { useAuthStore } from "@/lib/stores/auth-store";

/**
 * useAuthMutations — wraps all auth write operations (request OTP, verify, logout).
 *
 * Follows the project convention:
 * - onSuccess → handle side-effects (toast, redirect, store update).
 * - onError  → auto-toasted by QueryProvider's MutationCache (centralized).
 *   Do NOT add manual try/catch + toast.error here.
 *
 * Uses window.location.href for post-auth redirects to ensure:
 * - Full page reload with fresh middleware execution
 * - Cookies are properly set before navigation
 * - No client-side routing state conflicts
 */
export function useAuthMutations() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  // ── Request OTP ──────────────────────────────────────────
  const requestOTPMutation = useMutation({
    mutationFn: authApi.requestOTP,
    onSuccess: (data) => {
      toast.success(data.message || "OTP sent to your email.");
    },
  });

  // ── Verify OTP (login) ──────────────────────────────────
  const verifyOTPMutation = useMutation({
    mutationFn: authApi.verifyOTP,
    onSuccess: async (data) => {
      // If the backend returns the user object, seed the store immediately
      if (data.user) {
        setUser(data.user);
      }

      // Invalidate the /users/me cache so useCurrentUser re-fetches
      // (covers edge cases where the backend didn't return a user)
      await queryClient.invalidateQueries({ queryKey: authKeys.me() });

      toast.success(data.message || "Login successful.");

      // Redirect based on role — use window.location for hard refresh
      // to ensure cookies are properly set and middleware runs
      const user = data.user ?? useAuthStore.getState().user;
      if (user) {
        window.location.href = getRedirectPath(user);
      } else {
        // Safety fallback — shouldn't happen with a well-behaved backend
        window.location.href = "/";
      }
    },
  });

  // ── Logout ───────────────────────────────────────────────
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuth();
      queryClient.clear(); // Wipe all cached data — user is gone
      window.location.href = "/login";
    },
  });

  return {
    // Request OTP
    requestOTP: requestOTPMutation.mutate,
    isRequestingOTP: requestOTPMutation.isPending,

    // Verify OTP
    verifyOTP: verifyOTPMutation.mutate,
    isVerifyingOTP: verifyOTPMutation.isPending,

    // Logout
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
