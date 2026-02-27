"use client";

import { Key, Shield, Users } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

import { AdminApiKeysTable } from "@/app/(admin)/admin/_components/admin-api-keys-table";
import { ApiKeyDetailModal } from "@/app/(admin)/admin/_components/api-key-detail-modal";
import { KeyLimitModal } from "@/app/(admin)/admin/_components/key-limit-modal";
import { PortalHeader } from "@/app/(admin)/admin/_components/portal-header";
import { PortalOverviewTab } from "@/app/(admin)/admin/_components/portal-overview-tab";
import { PortalStatsCards } from "@/app/(admin)/admin/_components/portal-stats-cards";
import { UserDetailModal } from "@/app/(admin)/admin/_components/user-detail-modal";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { UsersTable } from "@/components/tables/users-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePortalMutations } from "@/hooks/use-portal-mutations";
import { usePortal, usePortalKeys, usePortalSpecificUsageSummary } from "@/hooks/use-portals";
import { usePortalUsers } from "@/hooks/use-users";
import type { ApiKeyResponse, PortalListResponse } from "@/lib/api/types";

export default function PortalDetailsPage() {
  const params = useParams();
  const portalId = params.portalId as string;

  const [activeTab, setActiveTab] = useState("overview");
  const [confirmAction, setConfirmAction] = useState<{
    type: "activate" | "deactivate";
  } | null>(null);

  // Modal states
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKeyResponse | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showKeyLimitModal, setShowKeyLimitModal] = useState(false);

  // API Keys state
  const [keysParams, setKeysParams] = useState({
    page: 1,
    page_size: 10,
    sort_by: "created_at",
    sort_order: "desc" as const,
  });

  // Users state
  const [usersParams, setUsersParams] = useState({
    page: 1,
    page_size: 10,
    sort_by: "created_at",
    sort_order: "desc" as const,
  });

  const { data: portal, isLoading } = usePortal(portalId);
  const { data: keysData, isLoading: isLoadingKeys } = usePortalKeys(portalId, keysParams);
  const { data: usersData, isLoading: isLoadingUsers } = usePortalUsers(portalId, usersParams);
  const { data: usageData } = usePortalSpecificUsageSummary(portalId);
  const { updatePortalStatus } = usePortalMutations();

  // Cast portal to PortalListResponse for optional fields
  const portalData = portal as PortalListResponse | undefined;

  const handleToggleStatus = async () => {
    if (!portalData || !confirmAction) return;

    await updatePortalStatus.mutateAsync({
      portalId: portalData.portal_id,
      data: {
        is_active: confirmAction.type === "activate",
        reason: `Portal ${confirmAction.type}d by admin`,
      },
    });
    setConfirmAction(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!portalData) {
    return (
      <div className="py-12 text-center">
        <Shield className="text-muted-foreground mx-auto h-12 w-12" />
        <h3 className="mt-4 text-lg font-semibold">Portal not found</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          The portal you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    );
  }

  // Filter out super_admin users from the list
  const filteredUsers = (usersData?.items || []).filter(
    (user) => !user.role_names.includes("super_admin")
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <PortalHeader
        portal={portalData}
        onToggleStatus={() =>
          setConfirmAction({ type: portalData.is_active ? "deactivate" : "activate" })
        }
      />

      <PortalStatsCards portal={portalData} onEditKeyLimit={() => setShowKeyLimitModal(true)} />

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            <Shield className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="keys" className="text-xs sm:text-sm">
            <Key className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="users" className="text-xs sm:text-sm">
            <Users className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Users
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <PortalOverviewTab portal={portalData} usageData={usageData} />
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="keys" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>API Keys Management</CardTitle>
              <CardDescription>Manage and monitor API keys for {portalData.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminApiKeysTable
                keys={keysData?.items || []}
                total={keysData?.total || 0}
                isLoading={isLoadingKeys}
                params={keysParams}
                onParamsChange={setKeysParams}
                onViewKey={(key) => setSelectedApiKey(key)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Users Management</CardTitle>
              <CardDescription>Manage users associated with {portalData.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <UsersTable
                users={filteredUsers}
                total={usersData?.total ? usersData.total - (usersData.items.length - filteredUsers.length) : 0}
                isLoading={isLoadingUsers}
                params={usersParams}
                onParamsChange={setUsersParams}
                onEdit={(user) => setSelectedUserId(user.id)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <ApiKeyDetailModal
        open={!!selectedApiKey}
        onOpenChange={(open) => !open && setSelectedApiKey(null)}
        apiKey={selectedApiKey}
        portalId={portalId}
      />

      <UserDetailModal
        open={!!selectedUserId}
        onOpenChange={(open) => !open && setSelectedUserId(null)}
        userId={selectedUserId}
      />

      <KeyLimitModal
        open={showKeyLimitModal}
        onOpenChange={setShowKeyLimitModal}
        portal={portalData}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={confirmAction?.type === "activate" ? "Activate Portal?" : "Deactivate Portal?"}
        description={
          confirmAction?.type === "activate"
            ? "This portal and its API keys will become active. API requests will be accepted."
            : "This portal and all its API keys will be deactivated. All API requests will be rejected."
        }
        confirmText={confirmAction?.type === "activate" ? "Activate" : "Deactivate"}
        variant={confirmAction?.type === "activate" ? "default" : "destructive"}
        onConfirm={handleToggleStatus}
        isLoading={updatePortalStatus.isPending}
      />
    </div>
  );
}
