import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiKeysApi } from '@/lib/api/api-keys';
import { ApiKeyGenerateRequest, ApiKeyQueryParams } from '@/lib/api/types';
import { toast } from 'sonner';

export function useApiKeys(params?: ApiKeyQueryParams) {
    return useQuery({
        queryKey: ['api-keys', params],
        queryFn: () => apiKeysApi.listMyKeys(params),
    });
}

export function useGenerateApiKey() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ApiKeyGenerateRequest) => apiKeysApi.generateKey(data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['api-keys'] });
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
            queryClient.invalidateQueries({ queryKey: ['api-keys'] });
            toast.success('API key revoked');
        },
    });
}
