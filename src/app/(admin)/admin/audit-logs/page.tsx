"use client"

import { useState } from "react"
import { Download, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuditLogsTable } from "@/components/tables/audit-logs-table"
import { DataExportButton } from "@/components/shared/data-export-button"
import { useAuditLogs } from "@/hooks/use-audit-logs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuditLogsPage() {
  const [params, setParams] = useState({
    page: 1,
    page_size: 20,
    sort_by: "timestamp" as const,
    sort_order: "desc" as const,
    search: "",
    event_type: undefined as string | undefined,
    portal_id: undefined as string | undefined,
    start_date: undefined as string | undefined,
    end_date: undefined as string | undefined,
  })

  const { data, isLoading } = useAuditLogs(params)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track all system activities and changes
          </p>
        </div>
        <DataExportButton
          data={data?.items || []}
          filename={`audit-logs-${new Date().toISOString().split('T')[0]}`}
          formats={["csv", "json"]}
          disabled={!data || data.items.length === 0}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Refine your audit log search</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events or portal..."
                  value={params.search || ""}
                  onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Event Type</label>
              <Select
                value={params.event_type || "all"}
                onValueChange={(value) =>
                  setParams({ ...params, event_type: value === "all" ? undefined : value, page: 1 })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Events" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="user:create">User Created</SelectItem>
                  <SelectItem value="user:update">User Updated</SelectItem>
                  <SelectItem value="user:deactivate">User Deactivated</SelectItem>
                  <SelectItem value="portal:onboard">Portal Onboarded</SelectItem>
                  <SelectItem value="portal:revoke">Portal Revoked</SelectItem>
                  <SelectItem value="apikey:generate">API Key Generated</SelectItem>
                  <SelectItem value="apikey:revoke">API Key Revoked</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={params.start_date || ""}
                  onChange={(e) => setParams({ ...params, start_date: e.target.value, page: 1 })}
                  placeholder="Start date"
                />
                <Input
                  type="date"
                  value={params.end_date || ""}
                  onChange={(e) => setParams({ ...params, end_date: e.target.value, page: 1 })}
                  placeholder="End date"
                />
              </div>
            </div>
          </div>

          {(params.search || params.event_type || params.start_date || params.end_date) && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setParams({
                    ...params,
                    search: "",
                    event_type: undefined,
                    start_date: undefined,
                    end_date: undefined,
                    page: 1,
                  })
                }
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AuditLogsTable
        logs={data?.items || []}
        total={data?.total || 0}
        isLoading={isLoading}
        params={params}
        onParamsChange={setParams}
      />
    </div>
  )
}
