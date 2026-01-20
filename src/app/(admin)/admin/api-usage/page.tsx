"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ApiUsageTable } from "@/components/tables/api-usage-table"
import type { ApiUsageRecord } from "@/types/api-usage"

// Mock data
const mockRecords: ApiUsageRecord[] = [
    {
        id: "1",
        gateway_txn_id: "txn-892-dcc",
        portal_id: "HR Department",
        portal_doc_id: null,
        api_key_id: "key-123",
        status: "COMPLETED",
        file_hash: "abc123...",
        final_signed_hash: "def456...",
        cdac_response_code: "200",
        cdac_esp_id: "esp-001",
        auth_mode: "AADHAAR",
        created_at: "2024-01-10T20:00:00Z",
        updated_at: "2024-01-10T20:05:00Z",
    },
    {
        id: "2",
        gateway_txn_id: "txn-830-4e7",
        portal_id: "Finance Department",
        portal_doc_id: null,
        api_key_id: "key-124",
        status: "FAILED",
        file_hash: "xyz789...",
        final_signed_hash: null,
        cdac_response_code: "500",
        cdac_esp_id: null,
        auth_mode: "OTP",
        created_at: "2024-01-10T19:58:15Z",
        updated_at: "2024-01-10T19:58:20Z",
    },
    {
        id: "3",
        gateway_txn_id: "txn-893-gh1",
        portal_id: "HR Department",
        portal_doc_id: null,
        api_key_id: "key-123",
        status: "PENDING",
        file_hash: "mno456...",
        final_signed_hash: null,
        cdac_response_code: null,
        cdac_esp_id: null,
        auth_mode: "AADHAAR",
        created_at: "2024-01-10T19:55:00Z",
        updated_at: "2024-01-10T19:55:00Z",
    },
]

export default function ApiUsagePage() {
    const [records] = useState<ApiUsageRecord[]>(mockRecords)
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(20)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")
    const [sortBy, setSortBy] = useState("created_at")
    const [sortOrder, setSortOrder] = useState("desc")

    // Filter logic
    const filteredRecords = records.filter((record) => {
        if (searchQuery && !record.gateway_txn_id.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false
        }
        if (statusFilter !== "all" && record.status !== statusFilter) {
            return false
        }
        return true
    })

    const totalPages = Math.ceil(filteredRecords.length / pageSize)
    const paginatedRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Global API Usage</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        View API usage across all portals
                    </p>
                </div>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </div>

            <ApiUsageTable
                records={paginatedRecords}
                total={filteredRecords.length}
                page={page}
                pageSize={pageSize}
                totalPages={totalPages}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                    setPageSize(size)
                    setPage(1)
                }}
                onSearchChange={(search) => {
                    setSearchQuery(search)
                    setPage(1)
                }}
                onStatusFilter={(status) => {
                    setStatusFilter(status)
                    setPage(1)
                }}
                onDateFilter={(from, to) => {
                    setFromDate(from)
                    setToDate(to)
                    setPage(1)
                }}
                onSortChange={(by, order) => {
                    setSortBy(by)
                    setSortOrder(order)
                }}
            />
        </div>
    )
}
