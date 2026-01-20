import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { portalsApi } from '@/lib/api/portals';
import { PortalOnboardingRequest, PortalQueryParams, ApiUsageQueryParams } from '@/lib/api/types';
import { toast } from 'sonner';

export function usePortals(params?: PortalQueryParams) {
    return useQuery({
        queryKey: ['portals', params],
        queryFn: () => portalsApi.listAll(params),
    });
}

export function usePortal(portalId: string) {
    return useQuery({
        queryKey: ['portals', portalId],
        queryFn: () => portalsApi.get(portalId),
        enabled: !!portalId,
    });
}

export function useMyPortal() {
    return useQuery({
        queryKey: ['my-portal'],
        queryFn: () => portalsApi.getMyPortal(),
    });
}

export function usePortalMetrics() {
    return useQuery({
        queryKey: ['portal-metrics'],
        queryFn: () => portalsApi.getMetrics(),
    });
}

export function usePortalKeys(portalId: string, params?: any) {
    return useQuery({
        queryKey: ['portal-keys', portalId, params],
        queryFn: () => portalsApi.listPortalKeys(portalId, params),
        enabled: !!portalId,
    });
}

export function usePortalUsageSummary(params?: ApiUsageQueryParams) {
    return useQuery({
        queryKey: ['portal-usage-summary', params],
        queryFn: () => portalsApi.getUsageSummary(params),
    });
}

export function useOnboardPortal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: PortalOnboardingRequest) => portalsApi.onboard(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portals'] });
            toast.success('Portal onboarded successfully');
        },
    });
}
