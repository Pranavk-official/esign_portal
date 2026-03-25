"use client";

import { useState } from "react";
import { MdAdd } from "react-icons/md";

import { OnboardPortalDialog } from "@/app/(admin)/admin/_components/onboard-portal-dialog";
import { PortalTable } from "@/components/tables/portal-table";
import { Button } from "@/components/ui/button";
import { usePortals } from "@/hooks/use-portals";

export default function AdminPortalsPage() {
  const [params, setParams] = useState({
    page: 1,
    page_size: 20,
    sort_by: "created_at",
    sort_order: "desc" as const,
    search: "",
    is_active: undefined as boolean | undefined,
  });

  const { data, isLoading } = usePortals(params);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Portal Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            View and manage all registered portals
          </p>
        </div>
        <OnboardPortalDialog>
          <Button className="bg-blue-600 text-white hover:bg-blue-700">
            <MdAdd className="mr-2 h-5 w-5" />
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
  );
}
