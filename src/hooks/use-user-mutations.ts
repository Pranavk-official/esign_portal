"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { usersApi } from "@/lib/api/users";
import { queryKeys } from "@/lib/auth/query-keys";
import type {
  PortalAdminUserCreateRequest,
  UserCreateRequest,
  UserUpdateRequest,
} from "@/lib/schemas/user";

// ── Super Admin mutations ──────────────────────────────────────────────────────

export function useUserMutations() {
  const queryClient = useQueryClient();

  const createUser = useMutation({
    mutationFn: (data: UserCreateRequest) => usersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("User created successfully");
    },
  });

  const updateUser = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UserUpdateRequest }) =>
      usersApi.update(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      toast.success("User updated successfully");
    },
  });

  const activateUser = useMutation({
    mutationFn: (userId: string) => usersApi.activate(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      toast.success("User activated successfully");
    },
  });

  const deactivateUser = useMutation({
    mutationFn: (userId: string) => usersApi.deactivate(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      toast.success("User deactivated successfully");
    },
  });

  const assignRoles = useMutation({
    mutationFn: ({ userId, roleNames }: { userId: string; roleNames: string[] }) =>
      usersApi.assignRoles(userId, roleNames),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      toast.success("Roles assigned successfully");
    },
  });

  const removeRoles = useMutation({
    mutationFn: ({ userId, roleNames }: { userId: string; roleNames: string[] }) =>
      usersApi.removeRoles(userId, roleNames),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      toast.success("Roles removed successfully");
    },
  });

  const bulkCreate = useMutation({
    mutationFn: (users: UserCreateRequest[]) => usersApi.bulkCreate(users),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(`${data.success_count} users created successfully`);
      if (data.failure_count > 0) {
        toast.error(`${data.failure_count} users failed to create`);
      }
    },
  });

  const bulkAssignRoles = useMutation({
    mutationFn: ({ userIds, roleNames }: { userIds: string[]; roleNames: string[] }) =>
      usersApi.bulkAssignRoles(userIds, roleNames),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success("Roles assigned to selected users");
    },
  });

  const bulkDeactivate = useMutation({
    mutationFn: (userIds: string[]) => usersApi.bulkDeactivate(userIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      toast.success(`${data.success_count} users deactivated`);
      if (data.failure_count > 0) {
        toast.error(`${data.failure_count} users could not be deactivated`);
      }
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

// ── Portal Admin mutations (v2 routes) ────────────────────────────────────────

export function usePortalUserMutations() {
  const queryClient = useQueryClient();

  const createUser = useMutation({
    mutationFn: (data: PortalAdminUserCreateRequest) => usersApi.createInMyPortal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.portalUsers.all });
      toast.success("Team member added successfully");
    },
  });

  /** Update email or is_active. Role changes use assignRoles (super admin only). */
  const updateUser = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UserUpdateRequest }) =>
      usersApi.updateInMyPortal(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.portalUsers.myDetail(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.portalUsers.lists() });
      toast.success("Team member updated successfully");
    },
  });

  const activateUser = useMutation({
    mutationFn: (userId: string) => usersApi.activateInMyPortal(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.portalUsers.myDetail(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.portalUsers.lists() });
      toast.success("Team member activated successfully");
    },
  });

  const deactivateUser = useMutation({
    mutationFn: (userId: string) => usersApi.deactivateInMyPortal(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.portalUsers.myDetail(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.portalUsers.lists() });
      toast.success("Team member deactivated successfully");
    },
  });

  return {
    createUser,
    updateUser,
    activateUser,
    deactivateUser,
  };
}
