"use client";

import { useState } from "react";
import { MdAdd, MdSearch } from "react-icons/md";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ApiKeysTable } from "@/components/tables/api-keys-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApiKeys, useRevokeApiKey } from "@/hooks/use-api-keys";

import { GenerateKeyDialog } from "../../_components/generate-key-dialog";

export default function ApiKeysPage() {
  const [params, setParams] = useState({
    page: 1,
    page_size: 20,
    sort_by: "created_at",
    sort_order: "desc" as const,
    search: "",
    environment: undefined as "LIVE" | "TEST" | undefined,
    is_active: undefined as boolean | undefined,
  });
  const [revokeDialog, setRevokeDialog] = useState<{
    open: boolean;
    keyId: string | null;
  }>({ open: false, keyId: null });

  const { data, isLoading } = useApiKeys(params);
  const { mutate: revokeKey, isPending: isRevoking } = useRevokeApiKey();

  const handleRevoke = (keyId: string) => {
    setRevokeDialog({ open: true, keyId });
  };

  const confirmRevoke = () => {
    if (revokeDialog.keyId) {
      revokeKey(
        { keyId: revokeDialog.keyId, reason: "Revoked by user" },
        {
          onSuccess: () => {
            setRevokeDialog({ open: false, keyId: null });
          },
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">API Keys</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your API authentication keys</p>
        </div>
        <GenerateKeyDialog>
          <Button className="bg-blue-600 text-white hover:bg-blue-700">
            <MdAdd className="mr-2 h-5 w-5" />
            Generate Key
          </Button>
        </GenerateKeyDialog>
      </div>

      {/* Table Section */}
      <div className="rounded-md border bg-white p-4">
        <div className="mb-4 flex items-center gap-4">
          <div className="relative max-w-sm flex-1">
            <MdSearch className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by key name or prefix..."
              value={params.search}
              onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })}
              className="pl-10"
            />
          </div>
        </div>

        <ApiKeysTable
          keys={data?.items || []}
          total={data?.total || 0}
          isLoading={isLoading}
          params={params}
          onParamsChange={setParams}
          onRevoke={handleRevoke}
        />
      </div>

      <ConfirmDialog
        open={revokeDialog.open}
        onOpenChange={(open) => setRevokeDialog({ open, keyId: null })}
        title="Revoke API Key"
        description="Are you sure you want to revoke this API key? This action cannot be undone and will immediately invalidate the key."
        confirmText="Revoke Key"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmRevoke}
        isLoading={isRevoking}
      />
    </div>
  );
}
