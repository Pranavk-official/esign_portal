"use client";

import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { setOnSessionExpired } from "@/lib/api/client";
import { AppError } from "@/lib/errors";
import { useAuthStore } from "@/lib/stores/auth-store";

// Extend React Query's Meta type to include our custom options
declare module "@tanstack/react-query" {
  interface Register {
    defaultError: AppError;
    mutationMeta: {
      suppressErrorToast?: boolean;
    };
  }
}

export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onError: (error, _variables, _context, mutation) => {
            if (mutation.meta?.suppressErrorToast) return;
            toast.error(error.message);
          },
        }),

        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // Register the session-expired callback once.
  // When the Axios interceptor detects a dead refresh token, it calls this
  // instead of doing `window.location.href = "/login"`.
  useEffect(() => {
    setOnSessionExpired(() => {
      clearAuth();
      queryClient.clear();
      toast.error("Session expired. Please login again.");
      router.push("/login");
    });
  }, [clearAuth, queryClient, router]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
