"use client";

import { format } from "date-fns";
import { Calendar, ChevronDown, ChevronUp, Filter, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { Column, DataTable } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiUsageRecord } from "@/lib/api/usage";

interface ApiUsageTableProps {
  records: ApiUsageRecord[];
  total: number;
  isLoading?: boolean;
  params: any;
  onParamsChange: (params: any) => void;
}

const getStatusVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
  switch (status) {
    case "COMPLETED":
      return "default";
    case "FAILED":
      return "destructive";
    case "PENDING":
      return "secondary";
    default:
      return "outline";
  }
};

export function ApiUsageTable({
  records,
  total,
  isLoading,
  params,
  onParamsChange,
}: ApiUsageTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const toggleRow = useCallback((id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  }, [expandedRows]);

  const columns = useMemo<Column<ApiUsageRecord>[]>(
    () => [
      {
        id: "gateway_txn_id",
        header: "Transaction Details",
        cell: (row) => {
          const isExpanded = expandedRows.has(row.gateway_txn_id);
          return (
            <div className="py-1">
              {/* Mobile Layout */}
              <div className="sm:hidden">
                <button
                  onClick={() => toggleRow(row.gateway_txn_id)}
                  className="w-full text-left active:bg-gray-50 rounded-lg -m-2 p-2 transition-colors touch-manipulation"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs font-medium text-gray-900 truncate mb-1" title={row.gateway_txn_id}>
                        {row.gateway_txn_id.slice(0, 16)}...
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant={getStatusVariant(row.status)} className="text-[10px] px-1.5 py-0.5 font-medium">
                          {row.status}
                        </Badge>
                        <span className="text-[10px] text-gray-500">
                          {row.created_at ? format(new Date(row.created_at), "dd/MM/yy HH:mm") : "-"}
                        </span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                  
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Portal:</span>
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                          {row.portal_id}
                        </Badge>
                      </div>
                      {row.api_key_name && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">API Key:</span>
                          <span className="font-medium text-gray-700 truncate max-w-[60%]" title={row.api_key_name}>
                            {row.api_key_name}
                          </span>
                        </div>
                      )}
                      {row.auth_mode && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Auth Mode:</span>
                          <span className="font-medium text-gray-700">{row.auth_mode}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Full Transaction ID:</span>
                      </div>
                      <div className="font-mono text-[10px] bg-gray-50 p-2 rounded break-all text-gray-700">
                        {row.gateway_txn_id}
                      </div>
                    </div>
                  )}
                </button>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:block">
                <div className="font-mono text-sm text-gray-900 truncate max-w-[220px] lg:max-w-[280px]" title={row.gateway_txn_id}>
                  {row.gateway_txn_id}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: "portal_id",
        header: "Portal / Key",
        cell: (row) => (
          <div className="flex flex-col gap-1.5 min-w-[140px]">
            <Badge variant="outline" className="w-fit text-xs px-2 py-0.5 font-medium">
              {row.portal_id}
            </Badge>
            {row.api_key_name && (
              <span className="text-muted-foreground text-xs truncate max-w-[160px]" title={row.api_key_name}>
                {row.api_key_name}
              </span>
            )}
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: (row) => (
          <Badge variant={getStatusVariant(row.status)} className="text-xs whitespace-nowrap font-medium">
            {row.status}
          </Badge>
        ),
      },
      {
        id: "auth_mode",
        header: "Auth Mode",
        cell: (row) => (
          <span className="text-sm text-gray-700 whitespace-nowrap font-medium">{row.auth_mode || "-"}</span>
        ),
      },
      {
        id: "created_at",
        header: "Created At",
        cell: (row) => (
          <div className="flex flex-col min-w-[120px]">
            <span className="text-sm text-gray-900 whitespace-nowrap font-medium">
              {row.created_at
                ? format(new Date(row.created_at), "dd/MM/yyyy")
                : "-"}
            </span>
            <span className="text-xs text-gray-500">
              {row.created_at
                ? format(new Date(row.created_at), "HH:mm:ss")
                : ""}
            </span>
          </div>
        ),
      },
    ],
    [expandedRows, toggleRow]
  );

  const hasActiveFilters = params.status || params.start_date || params.end_date;

  const clearFilters = () => {
    onParamsChange({
      ...params,
      status: undefined,
      start_date: undefined,
      end_date: undefined,
      page: 1,
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Bar - Always Visible */}
      <div className="relative">
        <Input
          placeholder="Search transactions..."
          value={params.search || ""}
          onChange={(e) => onParamsChange({ ...params, search: e.target.value, page: 1 })}
          className="w-full bg-white text-sm sm:text-base h-11 sm:h-10 pl-4 pr-4 rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500/20 touch-manipulation"
        />
      </div>

      {/* Mobile Filters - Collapsible */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="h-10 px-4 rounded-xl touch-manipulation active:scale-95 transition-transform"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                {[params.status, params.start_date, params.end_date].filter(Boolean).length}
              </Badge>
            )}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-10 px-3 text-gray-600 touch-manipulation active:scale-95 transition-transform"
            >
              <X className="h-4 w-4 mr-1.5" />
              Clear
            </Button>
          )}
        </div>

        <Collapsible open={showFilters} onOpenChange={setShowFilters}>
          <CollapsibleContent>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="space-y-3">
                {/* Status Filter */}
                <div className="w-full">
                  <label className="text-xs font-medium text-gray-700 mb-1.5 block">Status</label>
                  <Select
                    value={params.status || "all"}
                    onValueChange={(value) =>
                      onParamsChange({ ...params, status: value === "all" ? undefined : value, page: 1 })
                    }
                  >
                    <SelectTrigger className="w-full bg-white h-11 text-sm rounded-lg touch-manipulation">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="h-11">All Status</SelectItem>
                      <SelectItem value="COMPLETED" className="h-11">Completed</SelectItem>
                      <SelectItem value="FAILED" className="h-11">Failed</SelectItem>
                      <SelectItem value="PENDING" className="h-11">Pending</SelectItem>
                      <SelectItem value="USER_CANCELLED" className="h-11">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range Filters */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Start Date */}
                  <div className="w-full">
                    <label className="text-xs font-medium text-gray-700 mb-1.5 block flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      From
                    </label>
                    <Input
                      type="date"
                      value={params.start_date || ""}
                      onChange={(e) => onParamsChange({ ...params, start_date: e.target.value, page: 1 })}
                      className="w-full bg-white h-11 text-sm rounded-lg touch-manipulation"
                    />
                  </div>

                  {/* End Date */}
                  <div className="w-full">
                    <label className="text-xs font-medium text-gray-700 mb-1.5 block flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      To
                    </label>
                    <Input
                      type="date"
                      value={params.end_date || ""}
                      onChange={(e) => onParamsChange({ ...params, end_date: e.target.value, page: 1 })}
                      className="w-full bg-white h-11 text-sm rounded-lg touch-manipulation"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Desktop Filters - Always Visible */}
      <div className="hidden sm:block">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-end gap-3">
            {/* Status Filter */}
            <div className="flex-1 max-w-[180px]">
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">Status</label>
              <Select
                value={params.status || "all"}
                onValueChange={(value) =>
                  onParamsChange({ ...params, status: value === "all" ? undefined : value, page: 1 })
                }
              >
                <SelectTrigger className="w-full bg-white h-10 text-sm rounded-lg">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="USER_CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filters */}
            <div className="flex gap-3">
              {/* Start Date */}
              <div className="w-[160px]">
                <label className="text-xs font-medium text-gray-700 mb-1.5 block flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  From
                </label>
                <Input
                  type="date"
                  value={params.start_date || ""}
                  onChange={(e) => onParamsChange({ ...params, start_date: e.target.value, page: 1 })}
                  className="w-full bg-white h-10 text-sm rounded-lg"
                />
              </div>

              {/* End Date */}
              <div className="w-[160px]">
                <label className="text-xs font-medium text-gray-700 mb-1.5 block flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  To
                </label>
                <Input
                  type="date"
                  value={params.end_date || ""}
                  onChange={(e) => onParamsChange({ ...params, end_date: e.target.value, page: 1 })}
                  className="w-full bg-white h-10 text-sm rounded-lg"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="h-10"
              >
                <X className="h-4 w-4 mr-1.5" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto overscroll-x-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          <DataTable
            columns={columns}
            data={records}
            totalCount={total}
            isLoading={isLoading}
            emptyMessage="No API usage records found"
            page={params.page || 1}
            pageSize={params.page_size || 20}
            onPageChange={(page) => onParamsChange({ ...params, page })}
            onPageSizeChange={(page_size) => onParamsChange({ ...params, page_size, page: 1 })}
          />
        </div>
      </div>
    </div>
  );
}
