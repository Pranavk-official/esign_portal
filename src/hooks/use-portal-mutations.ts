"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { portalsApi, type PortalStatusUpdateRequest, type PortalKeyLimitUpdate, type ApiKeyStatusUpdateRequest, type ApiKeyTxnCountUpdateRequest } from "@/lib/api/portals"
import { toast } from "sonner"

export function usePortalMutations() {
    const queryClient = useQueryClient()

    const updatePortalStatus = useMutation({
        mutationFn: ({ portalId, data }: { portalId: string; data: PortalStatusUpdateRequest }) =>
            portalsApi.updateStatus(portalId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["portals"] })
            queryClient.invalidateQueries({ queryKey: ["portals", variables.portalId] })
            const action = variables.data.is_active ? "activated" : "deactivated"
            toast.success(`Portal ${action} successfully`)
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || "Failed to update portal status")
        },
    })

    const updateKeyLimits = useMutation({
        mutationFn: ({ portalId, data }: { portalId: string; data: PortalKeyLimitUpdate }) =>
            portalsApi.updateKeyLimits(portalId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["portals"] })
            queryClient.invalidateQueries({ queryKey: ["portals", variables.portalId] })
            toast.success("Portal key limits updated successfully")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || "Failed to update key limits")
        },
    })

    const updateKeyStatus = useMutation({
        mutationFn: ({ portalId, keyId, data }: { portalId: string; keyId: string; data: ApiKeyStatusUpdateRequest }) =>
            portalsApi.updateKeyStatus(portalId, keyId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["portal-keys", variables.portalId] })
            queryClient.invalidateQueries({ queryKey: ["api-keys"] })
            const action = variables.data.is_active ? "activated" : "revoked"
            toast.success(`API key ${action} successfully`)
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || "Failed to update API key status")
        },
    })

    const updateKeyTxnCount = useMutation({
        mutationFn: ({ portalId, keyId, data }: { portalId: string; keyId: string; data: ApiKeyTxnCountUpdateRequest }) =>
            portalsApi.updateKeyTxnCount(portalId, keyId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["portal-keys", variables.portalId] })
            queryClient.invalidateQueries({ queryKey: ["api-keys"] })
            toast.success("API key transaction limits updated successfully")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || "Failed to update transaction limits")
        },
    })

    return {
        updatePortalStatus,
        updateKeyLimits,
        updateKeyStatus,
        updateKeyTxnCount,
    }
}
