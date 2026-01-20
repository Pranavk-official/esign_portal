"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserTable } from "@/components/shared/user-table"
import type { UserListResponse } from "@/types/user"

// Mock data - replace with actual API call
const mockUsers: UserListResponse[] = [
  {
    id: "1",
    email: "john.doe@example.com",
    portal_id: "HR Department",
    is_active: true,
    roles: [{ id: "1", name: "portal_admin", description: null }],
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    email: "jane.smith@example.com",
    portal_id: "Finance Department",
    is_active: true,
    roles: [{ id: "2", name: "portal_user", description: null }],
    created_at: "2024-01-14T09:00:00Z",
    updated_at: "2024-01-14T09:00:00Z",
  },
  {
    id: "3",
    email: "super@example.com",
    portal_id: null,
    is_active: true,
    roles: [{ id: "3", name: "super_admin", description: null }],
    created_at: "2024-01-10T08:00:00Z",
    updated_at: "2024-01-10T08:00:00Z",
  },
]

export default function GlobalUsersPage() {
  const [users] = useState<UserListResponse[]>(mockUsers)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState("desc")

  // Filter and sort logic
  const filteredUsers = users.filter((user) => {
    if (searchQuery && !user.email.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (roleFilter !== "all" && !user.roles.some((r) => r.name === roleFilter)) {
      return false
    }
    if (statusFilter === "active" && !user.is_active) return false
    if (statusFilter === "inactive" && user.is_active) return false
    return true
  })

  const totalPages = Math.ceil(filteredUsers.length / pageSize)
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize)

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1)
  }

  const handleSearchChange = (search: string) => {
    setSearchQuery(search)
    setPage(1)
  }

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role)
    setPage(1)
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setPage(1)
  }

  const handleSortChange = (field: string, order: string) => {
    setSortBy(field)
    setSortOrder(order)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Global User Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage users across all portals
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      <UserTable
        users={paginatedUsers}
        total={filteredUsers.length}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSearchChange={handleSearchChange}
        onRoleFilter={handleRoleFilter}
        onStatusFilter={handleStatusFilter}
        onSortChange={handleSortChange}
      />
    </div>
  )
}
