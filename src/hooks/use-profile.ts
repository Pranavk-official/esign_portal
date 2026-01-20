"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { profileApi, type UpdateProfileRequest } from "@/lib/api/profile"
import { toast } from "sonner"

export function useProfile() {
    return useQuery({
        queryKey: ["profile"],
        queryFn: () => profileApi.getProfile(),
    })
}

export function useProfileMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: UpdateProfileRequest) => profileApi.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] })
            toast.success("Profile updated successfully")
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || "Failed to update profile")
        },
    })
}

export function useUserActivity() {
    return useQuery({
        queryKey: ["user-activity"],
        queryFn: () => profileApi.getActivity(),
    })
}
