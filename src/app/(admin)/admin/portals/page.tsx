"use client"

import { useState } from "react"
import { MdAdd } from "react-icons/md"
import { Button } from "@/components/ui/button"
import { PortalTable } from "@/components/tables/portal-table"
import { OnboardPortalDialog } from "@/app/(admin)/admin/_components/onboard-portal-dialog"
import { usePortals } from "@/hooks/use-portals"

export default function AdminPortalsPage() {
  const [params, setParams] = useState({
    page: 1,
    page_size: 20,
    sort_by: "created_at",
    sort_order: "desc" as const,
    search: "",
    is_active: undefined as boolean | undefined,
  })

  const { data, isLoading } = usePortals(params)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Portal Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage all registered portals
          </p>
        </div>
        <OnboardPortalDialog>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <MdAdd className="h-5 w-5 mr-2" />
            Onboard Portal
          </Button>
        </OnboardPortalDialog>
      </div>

      <PortalTable
        portals={data?.items || []}
        total={data?.total || 0}
        isLoading={isLoading}
        params={params}
        onParamsChange={setParams}
      />
    </div>
  )
}
