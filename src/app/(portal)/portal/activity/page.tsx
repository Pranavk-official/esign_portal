"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { RecentActivityTable } from "@/components/tables/recent-activity-table";
import { auditLogsApi } from "@/lib/api/audit-logs";

export default function RecentActivityPage() {
  const [params, setParams] = useState({
    page: 1,
    page_size: 20,
    search: "",
    event_type: "all" as string,
  });

  // Fetch real data from API
  const { data, isLoading, error } = useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () =>
      auditLogsApi.list({
        page: params.page,
        page_size: params.page_size,
        search: params.search || undefined,
        event_type: params.event_type !== "all" ? params.event_type : undefined,
      }),
  });

  const activities = data?.data || [];
  const _totalPages = data?.total_pages || 0;

  const handleParamsChange = (newParams: Record<string, number | string>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Recent Activity</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              View your recent actions and changes
            </p>
          </div>
        </div>
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading activity...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Recent Activity</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              View your recent actions and changes
            </p>
          </div>
        </div>
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
          <p className="text-red-500">Error loading activity data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recent Activity</h1>
          <p className="text-muted-foreground mt-1 text-sm">View your recent actions and changes</p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-lg border-2 border-dashed">
          <div className="text-center">
            <p className="text-muted-foreground">No activity records found</p>
          </div>
        </div>
      ) : (
        <RecentActivityTable
          activities={activities}
          total={data?.total || 0}
          params={params}
          onParamsChange={handleParamsChange}
        />
      )}
    </div>
  );
}
