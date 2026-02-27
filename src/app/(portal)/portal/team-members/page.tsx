"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { PortalUsersTable } from "@/app/(portal)/_components/portal-users-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { UserFormDialog } from "@/components/shared/user-form-dialog";
import { Button } from "@/components/ui/button";
import { usePortalUserMutations } from "@/hooks/use-user-mutations";
import { useMyPortalUsers } from "@/hooks/use-users";
import type { UserCreateRequest, UserDetailResponse } from "@/lib/schemas/user";

// Available roles for portal users
const PORTAL_ROLES = [
  { id: "1", name: "portal_admin", description: "Portal Administrator" },
  { id: "2", name: "portal_user", description: "Portal User" },
];

export default function PortalUsersPage() {
  const [params, setParams] = useState({
    page: 1,
    page_size: 20,
    sort_by: "created_at",
    sort_order: "desc" as const,
    search: "",
    role_name: undefined as string | undefined,
    is_active: undefined as boolean | undefined,
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDetailResponse | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "activate" | "deactivate";
    userId: string;
  } | null>(null);

  const { data, isLoading } = useMyPortalUsers(params);
  const { createUser, updateUser, activateUser, deactivateUser } = usePortalUserMutations();

  const handleCreateUser = async (formData: Omit<UserCreateRequest, "portal_id">) => {
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

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    if (confirmAction.type === "activate") {
      await activateUser.mutateAsync(confirmAction.userId);
    } else {
      await deactivateUser.mutateAsync(confirmAction.userId);
    }
    setConfirmAction(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Members</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage users in your portal</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Team Member
        </Button>
      </div>

      <PortalUsersTable
        users={data?.items || []}
        total={data?.total || 0}
        isLoading={isLoading}
        params={params}
        onParamsChange={setParams}
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
        availableRoles={PORTAL_ROLES}
        showPortalField={false}
      />

      <UserFormDialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
        mode="edit"
        user={editingUser}
        onSubmit={handleUpdateUser}
        isLoading={updateUser.isPending}
        availableRoles={PORTAL_ROLES}
        showPortalField={false}
      />

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={
          confirmAction?.type === "activate" ? "Activate Team Member?" : "Deactivate Team Member?"
        }
        description={
          confirmAction?.type === "activate"
            ? "This team member will be able to access the portal again."
            : "This team member will lose access to the portal."
        }
        confirmText={confirmAction?.type === "activate" ? "Activate" : "Deactivate"}
        variant={confirmAction?.type === "activate" ? "default" : "destructive"}
        onConfirm={handleConfirmAction}
        isLoading={activateUser.isPending || deactivateUser.isPending}
      />
    </div>
  );
}
