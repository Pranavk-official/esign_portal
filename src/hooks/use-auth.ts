"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authApi } from "@/lib/api/auth";
import { getRedirectPathForUser } from "@/lib/auth-utils";
import { OTPRequestForm, OTPVerifyForm } from "@/lib/schemas/auth";
import { useAuthStore } from "@/lib/stores/auth-store";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setUser, clearAuth } = useAuthStore();

  const requestOTPMutation = useMutation({
    mutationFn: (data: OTPRequestForm) => authApi.requestOTP(data),
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send OTP");
    },
  });

  const verifyOTPMutation = useMutation({
    mutationFn: (data: OTPVerifyForm) => authApi.verifyOTP(data),
    onSuccess: async (data) => {
      toast.success(data.message);

      // Fetch fresh user data from the backend to ensure we have the complete user object
      try {
        const userData = await authApi.getMe();
        setUser(userData);

        // Redirect based on role using centralized utility
        const redirectPath = getRedirectPathForUser(userData);
        router.push(redirectPath);
      } catch (error) {
        // If fetching user fails, clear auth and show error
        clearAuth();
        toast.error("Failed to fetch user data. Please try logging in again.");
        router.push("/login");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "OTP verification failed");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      toast.success("Logged out successfully");
      router.push("/login");
    },
  });

  return {
    requestOTP: requestOTPMutation.mutate,
    isRequestingOTP: requestOTPMutation.isPending,
    verifyOTP: verifyOTPMutation.mutate,
    isVerifyingOTP: verifyOTPMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
};
