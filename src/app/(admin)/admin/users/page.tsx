"use client";

import { Plus, Upload, UserMinus } from "lucide-react";
import { useState } from "react";

import { BulkActionToolbar } from "@/components/shared/bulk-action-toolbar";
import { BulkUserUpload } from "@/components/shared/bulk-user-upload";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { UserFormDialog } from "@/components/shared/user-form-dialog";
import { UsersTable } from "@/components/tables/users-table";
import { Button } from "@/components/ui/button";
import { useUserMutations } from "@/hooks/use-user-mutations";
import { useUsers } from "@/hooks/use-users";
import type { UserListResponse } from "@/lib/api/types";
import type { UserCreateRequest } from "@/lib/schemas/user";

export default function GlobalUsersPage() {
  const [params, setParams] = useState({
    page: 1,
    page_size: 20,
    sort_by: "created_at",
    sort_order: "desc" as const,
    search: "",
    role_name: undefined as string | undefined,
    is_active: undefined as boolean | undefined,
  });

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserListResponse | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "activate" | "deactivate" | "bulk-deactivate";
    userId?: string;
  } | null>(null);

  const { data, isLoading } = useUsers(params);
  const { createUser, updateUser, activateUser, deactivateUser, bulkCreate, bulkDeactivate } =
    useUserMutations();

  const handleCreateUser = async (formData: UserCreateRequest) => {
    await createUser.mutateAsync(formData);
    setIsCreateDialogOpen(false);
  };

  const handleUpdateUser = async (formData: any) => {
    if (!editingUser) return;
    await updateUser.mutateAsync({
      userId: editingUser.id,
      data: {
        role_names: formData.role_names,
      },
    });
    setEditingUser(null);
  };

  const handleBulkUpload = async (users: UserCreateRequest[]) => {
    await bulkCreate.mutateAsync(users);
    setIsBulkUploadOpen(false);
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    switch (confirmAction.type) {
      case "activate":
        if (confirmAction.userId) {
          await activateUser.mutateAsync(confirmAction.userId);
        }
        break;
      case "deactivate":
        if (confirmAction.userId) {
          await deactivateUser.mutateAsync(confirmAction.userId);
        }
        break;
      case "bulk-deactivate":
        await bulkDeactivate.mutateAsync(selectedUsers);
        setSelectedUsers([]);
        break;
    }
    setConfirmAction(null);
  };

  const bulkActions = [
    {
      label: `Deactivate (${selectedUsers.length})`,
      icon: UserMinus,
      onClick: () => setConfirmAction({ type: "bulk-deactivate" }),
      variant: "destructive" as const,
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Global User Management</h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage users across all portals</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsBulkUploadOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Bulk Upload
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </div>
        </div>

        <BulkActionToolbar
          selectedCount={selectedUsers.length}
          totalCount={data?.total || 0}
          onClear={() => setSelectedUsers([])}
          actions={bulkActions}
        />

        <UsersTable
          users={data?.items || []}
          total={data?.total || 0}
          isLoading={isLoading}
          params={params}
          onParamsChange={setParams}
          selectedUsers={selectedUsers}
          onSelectedUsersChange={setSelectedUsers}
          onEdit={(user) => setEditingUser(user)}
          onToggleStatus={(user) => {
            setConfirmAction({
              type: user.is_active ? "deactivate" : "activate",
              userId: user.id,
            });
          }}
        />

        <UserFormDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          mode="create"
          onSubmit={handleCreateUser}
          isLoading={createUser.isPending}
          showPortalField={true}
        />

        <UserFormDialog
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          mode="edit"
          user={editingUser}
          onSubmit={handleUpdateUser}
          isLoading={updateUser.isPending}
          showPortalField={false}
        />

        <ConfirmDialog
          open={!!confirmAction}
          onOpenChange={(open) => !open && setConfirmAction(null)}
          title={
            confirmAction?.type === "bulk-deactivate"
              ? `Deactivate ${selectedUsers.length} Users?`
              : confirmAction?.type === "activate"
                ? "Activate User?"
                : "Deactivate User?"
          }
          description={
            confirmAction?.type === "bulk-deactivate"
              ? `This will deactivate ${selectedUsers.length} selected users. They will not be able to log in.`
              : confirmAction?.type === "activate"
                ? "This user will be able to log in again."
                : "This user will not be able to log in."
          }
          confirmText={confirmAction?.type === "activate" ? "Activate" : "Deactivate"}
          variant={confirmAction?.type === "activate" ? "default" : "destructive"}
          onConfirm={handleConfirmAction}
          isLoading={activateUser.isPending || deactivateUser.isPending || bulkDeactivate.isPending}
        />

        <BulkUserUpload
          open={isBulkUploadOpen}
          onOpenChange={setIsBulkUploadOpen}
          onUpload={handleBulkUpload}
          isLoading={bulkCreate.isPending}
        />
      </div>
    </>
  );
}
