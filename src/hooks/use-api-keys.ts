import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { apiKeysApi } from "@/lib/api/api-keys";
import { ApiKeyQueryParams } from "@/lib/api/types";
import { queryKeys } from "@/lib/auth/query-keys";
import { ApiKeyGenerateRequest } from "@/lib/schemas/api-key";

export function useApiKeys(params?: ApiKeyQueryParams) {
  return useQuery({
    queryKey: queryKeys.apiKeys.list(params),
    queryFn: () => apiKeysApi.listMyKeys(params),
  });
}

export function useGenerateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ApiKeyGenerateRequest) => apiKeysApi.generateKey(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all });
      toast.success(data.message);
    },
  });
}

export function useRevokeApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ keyId, reason }: { keyId: string; reason?: string }) =>
      apiKeysApi.revokeKey(keyId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all });
      toast.success("API key revoked");
    },
  });
}
