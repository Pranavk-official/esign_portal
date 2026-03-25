"use client";

import { format } from "date-fns";
import { BarChart3, Copy, Edit, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiKeyMutations } from "@/hooks/use-api-key-mutations";
import type { ApiKeyResponse } from "@/lib/api/types";

interface ApiKeyDetailModalProps {
  open: boolean;
  onClose: () => void;
  apiKey: ApiKeyResponse | null;
  isLoading?: boolean;
}

export function ApiKeyDetailModal({
  open,
  onClose,
  apiKey,
  isLoading,
}: ApiKeyDetailModalProps) {
  const [showPrefix, setShowPrefix] = useState(false);
  const [isEditingCallback, setIsEditingCallback] = useState(false);
  const [callbackUrl, setCallbackUrl] = useState("");
  const router = useRouter();
  const { updateCallback } = useApiKeyMutations();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleViewUsage = () => {
    if (apiKey) {
      router.push(`/portal/usage-reports?api_key_id=${apiKey.id}`);
      onClose();
    }
  };

  const handleUpdateCallback = async () => {
    if (!apiKey) return;
    
    try {
      await updateCallback.mutateAsync({
        keyId: apiKey.id,
        callbackUrl: callbackUrl || null,
      });
      setIsEditingCallback(false);
    } catch {
      // Error handled by mutation
    }
  };

  const startEditingCallback = () => {
    setCallbackUrl(apiKey?.callback_url || "");
    setIsEditingCallback(true);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-lg">
                {apiKey?.key_name || "API Key Details"}
              </DialogTitle>
              {apiKey && (
                <p className="mt-1 text-sm text-gray-500">View API key details</p>
              )}
            </div>
            {apiKey && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewUsage}
                  className="gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  View Usage
                </Button>
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
                    <label className="text-sm font-medium text-gray-600">Key ID</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded bg-gray-100 px-3 py-2 font-mono text-xs text-gray-800">
                      {apiKey.id}
                    </code>
                    <button
                      onClick={() => copyToClipboard(apiKey.id, "Key ID")}
                      className="rounded p-1.5 hover:bg-gray-100"
                      title="Copy Key ID"
                    >
                      <Copy className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-600">Key Prefix</label>
                    <button
                      onClick={() => setShowPrefix(!showPrefix)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      {showPrefix ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded bg-gray-100 px-3 py-2 font-mono text-xs text-gray-800">
                      {showPrefix ? apiKey.key_prefix : "••••••••"}
                    </code>
                    <button
                      onClick={() => copyToClipboard(apiKey.key_prefix, "Key Prefix")}
                      className="rounded p-1.5 hover:bg-gray-100"
                      title="Copy Key Prefix"
                    >
                      <Copy className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Transaction Limits */}
              <div className="space-y-3 border-b pb-4">
                <h3 className="font-semibold text-gray-900">Transaction Limits</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-xs text-gray-600">Max Transaction Count</p>
                    <p className="mt-1 text-xl font-bold text-gray-900">
                      {apiKey.max_txn_count?.toLocaleString() || "Unlimited"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-xs text-gray-600">Remaining</p>
                    <p className="mt-1 text-xl font-bold text-gray-900">
                      {apiKey.remaining_txn_count?.toLocaleString() || "Unlimited"}
                    </p>
                  </div>
                </div>
                {apiKey.max_txn_count_threshold && (
                  <div className="rounded-lg bg-amber-50 p-3">
                    <p className="text-xs text-amber-800">
                      Alert Threshold: {apiKey.max_txn_count_threshold.toLocaleString()}{" "}
                      transactions
                    </p>
                  </div>
                )}
              </div>

              {/* Callback URL */}
              <div className="space-y-3 border-b pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Callback URL</h3>
                  {!isEditingCallback && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={startEditingCallback}
                      className="gap-2"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  )}
                </div>
                {isEditingCallback ? (
                  <div className="space-y-3">
                    <Input
                      value={callbackUrl}
                      onChange={(e) => setCallbackUrl(e.target.value)}
                      placeholder="https://your-domain.com/callback"
                      className="font-mono text-xs"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleUpdateCallback}
                        disabled={updateCallback.isPending}
                      >
                        {updateCallback.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingCallback(false)}
                        disabled={updateCallback.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg bg-gray-50 p-4">
                    <code className="break-all font-mono text-xs text-gray-700">
                      {apiKey.callback_url || "Not configured"}
                    </code>
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Created At</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {apiKey.created_at
                      ? format(new Date(apiKey.created_at), "dd MMM yyyy, HH:mm")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Used</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {apiKey.last_used_at
                      ? format(new Date(apiKey.last_used_at), "dd MMM yyyy, HH:mm")
                      : "Never"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500">No API key data available</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
