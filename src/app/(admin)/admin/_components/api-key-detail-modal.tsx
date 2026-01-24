"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Copy, Edit2, Eye, EyeOff, Save, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePortalMutations } from "@/hooks/use-portal-mutations";
import type { ApiKeyResponse } from "@/lib/api/types";
import {
  type ApiKeyTxnCountFormData,
  apiKeyTxnCountFormSchema,
  type CallbackUrlUpdateRequest,
  callbackUrlUpdateSchema,
} from "@/lib/schemas/api-key";

interface ApiKeyDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiKey: ApiKeyResponse | null;
  portalId: string;
  isLoading?: boolean;
}

export function ApiKeyDetailModal({
  open,
  onOpenChange,
  apiKey,
  portalId,
  isLoading,
}: ApiKeyDetailModalProps) {
  const [showPrefix, setShowPrefix] = useState(false);
  const [editingTxnLimits, setEditingTxnLimits] = useState(false);
  const [editingCallback, setEditingCallback] = useState(false);
  const { updateKeyTxnCount, updateKeyCallback } = usePortalMutations();

  const txnLimitForm = useForm<ApiKeyTxnCountFormData>({
    resolver: zodResolver(apiKeyTxnCountFormSchema),
    defaultValues: {
      max_txn_count: apiKey?.max_txn_count?.toString() || "",
      max_txn_count_threshold: apiKey?.max_txn_count_threshold?.toString() || "",
    },
  });

  const callbackForm = useForm<CallbackUrlUpdateRequest>({
    resolver: zodResolver(callbackUrlUpdateSchema),
    defaultValues: {
      callback_url: apiKey?.callback_url || "",
    },
  });

  const handleTxnLimitSubmit = async (data: ApiKeyTxnCountFormData) => {
    if (!apiKey) return;

    const transformedData = {
      max_txn_count: data.max_txn_count ? parseInt(data.max_txn_count, 10) : null,
      max_txn_count_threshold: data.max_txn_count_threshold
        ? parseInt(data.max_txn_count_threshold, 10)
        : null,
    };

    await updateKeyTxnCount.mutateAsync({
      portalId,
      keyId: apiKey.id,
      data: transformedData,
    });
    setEditingTxnLimits(false);
    toast.success("Transaction limits updated successfully");
  };

  const handleCallbackSubmit = async (data: CallbackUrlUpdateRequest) => {
    if (!apiKey) return;

    await updateKeyCallback.mutateAsync({
      portalId,
      keyId: apiKey.id,
      callbackUrl: data.callback_url || null,
    });
    setEditingCallback(false);
    toast.success("Callback URL updated successfully");
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-lg">
                {apiKey?.key_name || "API Key Details"}
              </DialogTitle>
              {apiKey && (
                <p className="mt-1 text-sm text-gray-500">View and manage API key details</p>
              )}
            </div>
            {apiKey && (
              <div className="flex gap-2">
                <Badge
                  variant={apiKey.environment === "LIVE" ? "default" : "secondary"}
                  className={apiKey.environment === "LIVE" ? "bg-blue-600" : "bg-gray-400"}
                >
                  {apiKey.environment}
                </Badge>
                <Badge
                  variant={apiKey.is_active ? "default" : "secondary"}
                  className={apiKey.is_active ? "bg-blue-600" : ""}
                >
                  {apiKey.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="max-h-[calc(90vh-140px)] overflow-y-auto px-6 py-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : apiKey ? (
            <div className="space-y-6">
              {/* Key ID & Key Prefix */}
              <div className="grid grid-cols-2 gap-4 border-b pb-4">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-500">Key ID</div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(apiKey.id, "Key ID")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="font-mono text-sm text-gray-900">{apiKey.id}</div>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-500">Key Prefix</div>
                    <Button size="sm" variant="ghost" onClick={() => setShowPrefix(!showPrefix)}>
                      {showPrefix ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <code className="font-mono text-sm text-gray-900">
                    {showPrefix ? apiKey.key_prefix : `${apiKey.key_prefix.slice(0, 12)}...`}
                  </code>
                </div>
              </div>

              {/* Callback URL */}
              <div className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-500">Callback URL</div>
                  {!editingCallback && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        callbackForm.reset({ callback_url: apiKey.callback_url || "" });
                        setEditingCallback(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {editingCallback ? (
                  <Form {...callbackForm}>
                    <form
                      onSubmit={callbackForm.handleSubmit(handleCallbackSubmit)}
                      className="mt-2 space-y-3"
                    >
                      <FormField
                        control={callbackForm.control}
                        name="callback_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="https://example.com/callback"
                                className="font-mono text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={updateKeyCallback.isPending}>
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingCallback(false)}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="mt-1 font-mono text-sm break-all text-gray-900">
                    {apiKey.callback_url || "Not configured"}
                  </div>
                )}
              </div>

              {/* Transaction Limits */}
              <div className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-500">Transaction Limits</div>
                  {!editingTxnLimits && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        txnLimitForm.reset({
                          max_txn_count: apiKey.max_txn_count?.toString() || "",
                          max_txn_count_threshold: apiKey.max_txn_count_threshold?.toString() || "",
                        });
                        setEditingTxnLimits(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {editingTxnLimits ? (
                  <Form {...txnLimitForm}>
                    <form
                      onSubmit={txnLimitForm.handleSubmit(handleTxnLimitSubmit)}
                      className="mt-2 space-y-3"
                    >
                      <FormField
                        control={txnLimitForm.control}
                        name="max_txn_count"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Transaction Count</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="Unlimited" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={txnLimitForm.control}
                        name="max_txn_count_threshold"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Threshold</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="Not set" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={updateKeyTxnCount.isPending}>
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingTxnLimits(false)}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                      <p className="text-xs text-amber-600">
                        ⚠️ Updating max transaction count will reset the remaining count
                      </p>
                    </form>
                  </Form>
                ) : (
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Maximum:</span>
                      <span className="font-semibold text-gray-900">
                        {apiKey.max_txn_count?.toLocaleString() || "Unlimited"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining:</span>
                      <span className="font-semibold text-gray-900">
                        {apiKey.remaining_txn_count !== null
                          ? apiKey.remaining_txn_count.toLocaleString()
                          : "Unlimited"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Successful:</span>
                      <span className="font-semibold text-gray-900">
                        {apiKey.successful_txn_count.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Threshold:</span>
                      <span className="font-semibold text-gray-900">
                        {apiKey.max_txn_count_threshold?.toLocaleString() || "Not set"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Created & Last Used */}
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-500">Created</div>
                  <div className="mt-1 text-sm text-gray-900">
                    {format(new Date(apiKey.created_at), "dd/MM/yyyy")}
                  </div>
                </div>
                <div className="flex-1 text-right">
                  <div className="text-sm font-medium text-gray-500">Last Used</div>
                  <div className="mt-1 text-sm text-gray-900">
                    {apiKey.last_used_at
                      ? format(new Date(apiKey.last_used_at), "dd/MM/yyyy")
                      : "Never used"}
                  </div>
                </div>
              </div>

              {/* Expires */}
              {apiKey.expires_at && (
                <div className="flex items-center justify-between pb-4">
                  <div className="text-sm font-medium text-gray-500">Expires</div>
                  <div className="text-sm text-gray-900">
                    {format(new Date(apiKey.expires_at), "dd/MM/yyyy")}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-gray-500">No API key selected</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
