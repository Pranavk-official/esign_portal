"use client";

import { Activity, Clock, TrendingDown, TrendingUp } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { DataExportButton } from "@/components/shared/data-export-button";
import { MetricCard } from "@/components/shared/metric-card";
import { ApiUsageTable } from "@/components/tables/api-usage-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApiKeys } from "@/hooks/use-api-keys";
import { usePortalUsageSummary } from "@/hooks/use-portals";
import { useMyUsage } from "@/hooks/use-usage";

export default function PortalUsageReportsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const apiKeyIdFromUrl = useMemo(() => searchParams.get("api_key_id"), [searchParams]);

  const [params, setParams] = useState({
    page: 1,
    page_size: 20,
    sort_by: "created_at",
    sort_order: "desc" as const,
    search: "",
    status: undefined as string | undefined,
    start_date: undefined as string | undefined,
    end_date: undefined as string | undefined,
    api_key_id: apiKeyIdFromUrl || undefined,
  });

  const [dateRange, setDateRange] = useState("7d");

  // Sync params with URL when it changes
  const effectiveParams = useMemo(() => ({
    ...params,
    api_key_id: apiKeyIdFromUrl || params.api_key_id,
  }), [params, apiKeyIdFromUrl]);

  const { data: apiKeysData } = useApiKeys();
  const { data, isLoading } = useMyUsage(effectiveParams);
  const { data: summary, isLoading: summaryLoading } = usePortalUsageSummary({
    start_date: effectiveParams.start_date,
    end_date: effectiveParams.end_date,
    api_key_id: effectiveParams.api_key_id,
  });

  const handleApiKeyFilterChange = (value: string) => {
    const newApiKeyId = value === "all" ? undefined : value;
    setParams((prev) => ({ ...prev, api_key_id: newApiKeyId, page: 1 }));
    
    // Update URL
    const url = new URL(window.location.href);
    if (newApiKeyId) {
      url.searchParams.set("api_key_id", newApiKeyId);
    } else {
      url.searchParams.delete("api_key_id");
    }
    router.push(url.pathname + url.search, { scroll: false });
  };

  // Handle date range change
  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    const endDate = new Date();
    const startDate = new Date();

    switch (range) {
      case "24h":
        startDate.setHours(startDate.getHours() - 24);
        break;
      case "7d":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        return setParams({ ...params, start_date: undefined, end_date: undefined });
    }

    setParams({
      ...params,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usage Reports</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Track your API usage and transaction history
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={effectiveParams.api_key_id || "all"}
            onValueChange={handleApiKeyFilterChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by API Key" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All API Keys</SelectItem>
              {apiKeysData?.items.map((key) => (
                <SelectItem key={key.id} value={key.id}>
                  {key.key_name || key.key_prefix}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <DataExportButton
            data={data?.items || []}
            filename={`usage-report-${new Date().toISOString().split("T")[0]}`}
            formats={["csv", "json"]}
            disabled={!data || data.items.length === 0}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Transactions"
          value={summary?.total_transactions || 0}
          icon={Activity}
          isLoading={summaryLoading}
        />
        <MetricCard
          title="Completed"
          value={summary?.completed || 0}
          icon={TrendingUp}
          trend={{
            value: `${Math.round(((summary?.completed || 0) / (summary?.total_transactions || 1)) * 100)}%`,
            isPositive: true,
          }}
          isLoading={summaryLoading}
        />
        <MetricCard
          title="Failed"
          value={summary?.failed || 0}
          icon={TrendingDown}
          trend={{
            value: `${Math.round(((summary?.failed || 0) / (summary?.total_transactions || 1)) * 100)}%`,
            isPositive: false,
          }}
          isLoading={summaryLoading}
        />
        <MetricCard
          title="Pending"
          value={summary?.pending || 0}
          icon={Clock}
          isLoading={summaryLoading}
        />
      </div>

      <ApiUsageTable
        records={data?.items || []}
        total={data?.total || 0}
        isLoading={isLoading}
        params={effectiveParams}
        onParamsChange={setParams}
      />
    </div>
  );
}
