"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  type ApiKeyStatusUpdateRequest,
  type ApiKeyTxnCountUpdateRequest,
  type PortalKeyLimitUpdate,
  portalsApi,
  type PortalStatusUpdateRequest,
} from "@/lib/api/portals";
import { PortalOnboardingRequest } from "@/lib/api/types";
import { queryKeys } from "@/lib/auth/query-keys";

export function usePortalMutations() {
  const queryClient = useQueryClient();

  const updatePortalStatus = useMutation({
    mutationFn: ({ portalId, data }: { portalId: string; data: PortalStatusUpdateRequest }) =>
      portalsApi.updateStatus(portalId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.portals.detail(variables.portalId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.portals.lists() });
      const action = variables.data.is_active ? "activated" : "deactivated";
      toast.success(`Portal ${action} successfully`);
    },
  });

  const updateKeyLimits = useMutation({
    mutationFn: ({ portalId, data }: { portalId: string; data: PortalKeyLimitUpdate }) =>
      portalsApi.updateKeyLimits(portalId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.portals.detail(variables.portalId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.portals.lists() });
      toast.success("Portal key limits updated successfully");
    },
  });

  const updateKeyStatus = useMutation({
    mutationFn: ({
      portalId,
      keyId,
      data,
    }: {
      portalId: string;
      keyId: string;
      data: ApiKeyStatusUpdateRequest;
    }) => portalsApi.updateKeyStatus(portalId, keyId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.portals.keys(variables.portalId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all });
      const action = variables.data.is_active ? "activated" : "revoked";
      toast.success(`API key ${action} successfully`);
    },
  });

  const updateKeyTxnCount = useMutation({
    mutationFn: ({
      portalId,
      keyId,
      data,
    }: {
      portalId: string;
      keyId: string;
      data: ApiKeyTxnCountUpdateRequest;
    }) => portalsApi.updateKeyTxnCount(portalId, keyId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.portals.keys(variables.portalId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all });
      toast.success("Transaction limits updated successfully");
    },
  });

  const updateKeyCallback = useMutation({
    mutationFn: ({
      portalId,
      keyId,
      callbackUrl,
    }: {
      portalId: string;
      keyId: string;
      callbackUrl: string | null;
    }) => portalsApi.updateKeyCallback(portalId, keyId, callbackUrl),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.portals.keys(variables.portalId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all });
      toast.success("Callback URL updated successfully");
    },
  });

  return {
    updatePortalStatus,
    updateKeyLimits,
    updateKeyStatus,
    updateKeyTxnCount,
    updateKeyCallback,
  };
}

export function useOnboardPortal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PortalOnboardingRequest) => portalsApi.onboard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.portals.all });
      toast.success("Portal onboarded successfully");
    },
  });
}
