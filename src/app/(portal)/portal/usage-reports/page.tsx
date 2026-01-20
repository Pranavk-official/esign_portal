"use client"

import { useState } from "react"
import { Download, Activity, TrendingUp, TrendingDown, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ApiUsageTable } from "@/components/tables/api-usage-table"
import { DataExportButton } from "@/components/shared/data-export-button"
import { MetricCard } from "@/components/shared/metric-card"
import { useMyUsage } from "@/hooks/use-usage"
import { usePortalUsageSummary } from "@/hooks/use-portals"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function PortalUsageReportsPage() {
  const [params, setParams] = useState({
    page: 1,
    page_size: 20,
    sort_by: "created_at",
    sort_order: "desc" as const,
    search: "",
    status: undefined as string | undefined,
    start_date: undefined as string | undefined,
    end_date: undefined as string | undefined,
    api_key_id: undefined as string | undefined,
  })

  const [dateRange, setDateRange] = useState("7d")

  const { data, isLoading } = useMyUsage(params)
  const { data: summary, isLoading: summaryLoading } = usePortalUsageSummary({
    start_date: params.start_date,
    end_date: params.end_date,
  })

  // Handle date range change
  const handleDateRangeChange = (range: string) => {
    setDateRange(range)
    const endDate = new Date()
    const startDate = new Date()

    switch (range) {
      case "24h":
        startDate.setHours(startDate.getHours() - 24)
        break
      case "7d":
        startDate.setDate(startDate.getDate() - 7)
        break
      case "30d":
        startDate.setDate(startDate.getDate() - 30)
        break
      case "90d":
        startDate.setDate(startDate.getDate() - 90)
        break
      default:
        return setParams({ ...params, start_date: undefined, end_date: undefined })
    }

    setParams({
      ...params,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usage Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your API usage and transaction history
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            filename={`usage-report-${new Date().toISOString().split('T')[0]}`}
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
            value: `${Math.round((summary?.completed || 0) / (summary?.total_transactions || 1) * 100)}%`,
            isPositive: true,
          }}
          isLoading={summaryLoading}
        />
        <MetricCard
          title="Failed"
          value={summary?.failed || 0}
          icon={TrendingDown}
          trend={{
            value: `${Math.round((summary?.failed || 0) / (summary?.total_transactions || 1) * 100)}%`,
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
        params={params}
        onParamsChange={setParams}
      />
    </div>
  )
}
