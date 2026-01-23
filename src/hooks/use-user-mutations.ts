"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { usersApi } from "@/lib/api/users";
import type { UserCreateRequest, UserUpdateRequest } from "@/lib/schemas/user";

export function useUserMutations() {
  const queryClient = useQueryClient();

  const createUser = useMutation({
    mutationFn: (data: UserCreateRequest) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to create user");
    },
  });

  const updateUser = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UserUpdateRequest }) =>
      usersApi.update(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to update user");
    },
  });

  const activateUser = useMutation({
    mutationFn: (userId: string) => usersApi.activate(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User activated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to activate user");
    },
  });

  const deactivateUser = useMutation({
    mutationFn: (userId: string) => usersApi.deactivate(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deactivated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to deactivate user");
    },
  });

  const assignRoles = useMutation({
    mutationFn: ({ userId, roleNames }: { userId: string; roleNames: string[] }) =>
      usersApi.assignRoles(userId, roleNames),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Roles assigned successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to assign roles");
    },
  });

  const removeRoles = useMutation({
    mutationFn: ({ userId, roleNames }: { userId: string; roleNames: string[] }) =>
      usersApi.removeRoles(userId, roleNames),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Roles removed successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to remove roles");
    },
  });

  const bulkCreate = useMutation({
    mutationFn: (users: UserCreateRequest[]) => usersApi.bulkCreate(users),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(`${data.created.length} users created successfully`);
      if (data.failed.length > 0) {
        toast.error(`${data.failed.length} users failed to create`);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to create users");
    },
  });

  const bulkAssignRoles = useMutation({
    mutationFn: ({ userIds, roleNames }: { userIds: string[]; roleNames: string[] }) =>
      usersApi.bulkAssignRoles(userIds, roleNames),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Roles assigned to selected users");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to assign roles");
    },
  });

  const bulkDeactivate = useMutation({
    mutationFn: (userIds: string[]) => usersApi.bulkDeactivate(userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Selected users deactivated");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to deactivate users");
    },
  });

  return {
    createUser,
    updateUser,
    activateUser,
    deactivateUser,
    assignRoles,
    removeRoles,
    bulkCreate,
    bulkAssignRoles,
    bulkDeactivate,
  };
}

// Portal Manager mutations for their portal users
export function usePortalUserMutations() {
  const queryClient = useQueryClient();

  const createUser = useMutation({
    mutationFn: (data: Omit<UserCreateRequest, "portal_id">) => usersApi.createInMyPortal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-users"] });
      toast.success("Team member added successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to add team member");
    },
  });

  const updateUser = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UserUpdateRequest }) =>
      usersApi.updateInMyPortal(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-users"] });
      toast.success("Team member updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to update team member");
    },
  });

  const activateUser = useMutation({
    mutationFn: (userId: string) => usersApi.activateInMyPortal(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-users"] });
      toast.success("Team member activated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to activate team member");
    },
  });

  const deactivateUser = useMutation({
    mutationFn: (userId: string) => usersApi.deactivateInMyPortal(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portal-users"] });
      toast.success("Team member deactivated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to deactivate team member");
    },
  });

  return {
    createUser,
    updateUser,
    activateUser,
    deactivateUser,
  };
}
