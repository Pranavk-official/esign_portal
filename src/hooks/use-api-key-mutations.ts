"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiKeysApi, type CallbackUrlUpdate } from "@/lib/api/api-keys"
import { toast } from "sonner"

export function useApiKeyMutations() {
    const queryClient = useQueryClient()

    const updateCallback = useMutation({
        mutationFn: ({ keyId, callbackUrl }: { keyId: string; callbackUrl: string | null }) =>
            apiKeysApi.updateCallback(keyId, callbackUrl),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["api-keys"] })
            toast.success("Callback URL updated successfully")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || "Failed to update callback URL")
        },
    })

    return {
        updateCallback,
    }
}
