"use client"

import { useState } from "react"
import { MdAdd } from "react-icons/md"
import { Button } from "@/components/ui/button"
import { PortalTable } from "@/components/tables/portal-table"
import { OnboardPortalDialog } from "@/app/(admin)/admin/_components/onboard-portal-dialog"
import type { PortalListResponse } from "@/types/portal"

// Mock portal data adapted to match PortalListResponse
const mockPortals: PortalListResponse[] = [
  {
    portal_id: "portal-hr-001",
    name: "HR Department",
    is_active: true,
    live_key_limit: 5,
    revoke_reason: null,
    active_key_count: 3,
    total_key_count: 7,
    user_count: 12,
    created_at: "2024-10-01T00:00:00Z",
  },
  {
    portal_id: "portal-finance-002",
    name: "Finance Department",
    is_active: true,
    live_key_limit: 10,
    revoke_reason: null,
    active_key_count: 7,
    total_key_count: 10,
    user_count: 8,
    created_at: "2024-08-01T00:00:00Z",
  },
  {
    portal_id: "portal-ops-003",
    name: "Operations",
    is_active: false,
    live_key_limit: 3,
    revoke_reason: "Maintenance",
    active_key_count: 0,
    total_key_count: 5,
    user_count: 5,
    created_at: "2024-05-01T00:00:00Z",
  },
]

export default function AdminPortalsPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Mock handlers
  const handlePageChange = (newPage: number) => setPage(newPage)
  const handlePageSizeChange = (newSize: number) => setPageSize(newSize)
  const handleSearchChange = (val: string) => console.log("Search:", val)
  const handleStatusFilter = (active: boolean | null) => console.log("Status:", active)
  const handleSortChange = (by: string, order: string) => console.log("Sort:", by, order)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Portal Management</h1>
        <OnboardPortalDialog>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <MdAdd className="h-5 w-5 mr-2" />
            Onboard Portal
          </Button>
        </OnboardPortalDialog>
      </div>

      <PortalTable
        portals={mockPortals}
        total={mockPortals.length}
        page={page}
        pageSize={pageSize}
        totalPages={1}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSearchChange={handleSearchChange}
        onStatusFilter={handleStatusFilter}
        onSortChange={handleSortChange}
      />
    </div>
  )
}
