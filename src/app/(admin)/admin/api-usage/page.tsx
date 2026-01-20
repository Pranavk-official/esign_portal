"use client"

import { useState } from "react"
import { Download, Activity, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ApiUsageTable } from "@/components/tables/api-usage-table"
import { DataExportButton } from "@/components/shared/data-export-button"
import { useUsage, useUsageSummary } from "@/hooks/use-usage"
import { MetricCard } from "@/components/shared/metric-card"

export default function ApiUsagePage() {
    const [params, setParams] = useState({
        page: 1,
        page_size: 20,
        sort_by: "created_at",
        sort_order: "desc" as const,
        search: "",
        status: undefined as string | undefined,
        portal_id: undefined as string | undefined,
        start_date: undefined as string | undefined,
        end_date: undefined as string | undefined,
    })

    const { data, isLoading } = useUsage(params)
    const { data: summary, isLoading: summaryLoading } = useUsageSummary({
        start_date: params.start_date,
        end_date: params.end_date,
        portal_id: params.portal_id,
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Global API Usage</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Monitor API usage across all portals
                    </p>
                </div>
                <DataExportButton
                    data={data?.items || []}
                    filename={`api-usage-${new Date().toISOString().split('T')[0]}`}
                    formats={["csv", "json"]}
                    disabled={!data || data.items.length === 0}
                    isLoading={isLoading}
                />
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
                    icon={CheckCircle}
                    trend={{ value: `${summary?.completed || 0}`, isPositive: true }}
                    isLoading={summaryLoading}
                />
                <MetricCard
                    title="Failed"
                    value={summary?.failed || 0}
                    icon={AlertCircle}
                    trend={{ value: `${summary?.failed || 0}`, isPositive: false }}
                    isLoading={summaryLoading}
                />
                <MetricCard
                    title="Pending"
                    value={summary?.pending || 0}
                    icon={TrendingUp}
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
