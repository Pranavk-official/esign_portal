"use client"

import { useState } from "react"
import { MdAdd, MdSearch } from "react-icons/md"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ApiKeysTable } from "@/components/tables/api-keys-table"
import { GenerateKeyDialog } from "../../_components/generate-key-dialog"
import { useApiKeys, useRevokeApiKey } from "@/hooks/use-api-keys"

export default function ApiKeysPage() {
  const [params, setParams] = useState({
    page: 1,
    page_size: 20,
    sort_by: "created_at",
    sort_order: "desc" as const,
    search: "",
    environment: undefined as "LIVE" | "TEST" | undefined,
    is_active: undefined as boolean | undefined,
  })

  const { data, isLoading } = useApiKeys(params)
  const { mutate: revokeKey } = useRevokeApiKey()

  const handleRevoke = (keyId: string) => {
    if (confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
      revokeKey({ keyId, reason: "Revoked by user" })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">API Keys</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your API authentication keys
          </p>
        </div>
        <GenerateKeyDialog>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <MdAdd className="h-5 w-5 mr-2" />
            Generate Key
          </Button>
        </GenerateKeyDialog>
      </div>

      {/* Table Section */}
      <div className="rounded-md border bg-white p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-sm">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
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
    </div>
  )
}
