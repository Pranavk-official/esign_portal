"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiKeysApi } from "@/lib/api/api-keys";
import { queryKeys } from "@/lib/auth/query-keys";

export function useApiKeyMutations() {
  const queryClient = useQueryClient();

  const updateCallback = useMutation({
    mutationFn: ({ keyId, callbackUrl }: { keyId: string; callbackUrl: string | null }) =>
      apiKeysApi.updateCallback(keyId, callbackUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all });
      toast.success("Callback URL updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to update callback URL");
    },
  });

  return {
    updateCallback,
  };
}
