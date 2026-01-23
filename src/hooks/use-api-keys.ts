import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiKeysApi } from "@/lib/api/api-keys";
import { ApiKeyGenerateRequest, ApiKeyQueryParams } from "@/lib/api/types";

export function useApiKeys(params?: ApiKeyQueryParams) {
  return useQuery({
    queryKey: ["api-keys", params],
    queryFn: () => apiKeysApi.listMyKeys(params),
  });
}

export function useGenerateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ApiKeyGenerateRequest) => apiKeysApi.generateKey(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success(data.message);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to generate API key");
    },
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ keyId, reason }: { keyId: string; reason?: string }) =>
      apiKeysApi.revokeKey(keyId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key revoked");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to revoke API key");
    },
  });
}
