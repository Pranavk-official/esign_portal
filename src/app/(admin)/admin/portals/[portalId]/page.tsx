"use client";

import { format } from "date-fns";
import { Activity, Key, Power, PowerOff, Settings, Shield } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { usePortalMutations } from "@/hooks/use-portal-mutations";
import { usePortal, usePortalKeys } from "@/hooks/use-portals";
import type { PortalListResponse } from "@/lib/schemas/portal";

export default function PortalDetailsPage() {
  const params = useParams();
  const portalId = params.portalId as string;

  const [confirmAction, setConfirmAction] = useState<{
    type: "activate" | "deactivate";
  } | null>(null);

  const { data: portal, isLoading } = usePortal(portalId);
  const { data: keysData } = usePortalKeys(portalId, { page: 1, page_size: 10 });
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
          The portal you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{portalData.name}</h1>
            <p className="text-muted-foreground text-sm">{portalData.portal_id}</p>
          </div>
          <StatusBadge status={portalData.is_active} showIcon={true} />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={portalData.is_active ? "destructive" : "default"}
            onClick={() =>
              setConfirmAction({ type: portalData.is_active ? "deactivate" : "activate" })
            }
          >
            {portalData.is_active ? (
              <>
                <PowerOff className="mr-2 h-4 w-4" />
                Deactivate Portal
              </>
            ) : (
              <>
                <Power className="mr-2 h-4 w-4" />
                Activate Portal
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total API Keys</CardTitle>
            <Key className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keysData?.total || 0}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              {keysData?.items.filter((k) => k.is_active).length || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Key Limits</CardTitle>
            <Settings className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {portalData.max_keys || portalData.live_key_limit || "Unlimited"}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">Maximum allowed keys</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Environment</CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{portalData.environment || "N/A"}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {format(new Date(portalData.created_at), "MMM d, yyyy")}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {format(new Date(portalData.created_at), "h:mm a")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Portal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Portal Information</CardTitle>
          <CardDescription>Basic details about this portal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-muted-foreground text-sm font-medium">Portal ID</div>
              <div className="mt-1 font-mono text-sm">{portalData.portal_id}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm font-medium">Portal Name</div>
              <div className="mt-1 text-sm">{portalData.name}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm font-medium">Status</div>
              <div className="mt-1">
                <StatusBadge status={portalData.is_active} showIcon={true} />
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm font-medium">Environment</div>
              <div className="mt-1 text-sm">
                <Badge variant="outline">{portalData.environment || "Not set"}</Badge>
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm font-medium">Description</div>
              <div className="mt-1 text-sm">{portalData.description || "No description"}</div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-muted-foreground text-sm font-medium">Created At</div>
              <div className="mt-1 text-sm">{format(new Date(portalData.created_at), "PPpp")}</div>
            </div>
            {portalData.updated_at && (
              <div>
                <div className="text-muted-foreground text-sm font-medium">Last Updated</div>
                <div className="mt-1 text-sm">
                  {format(new Date(portalData.updated_at), "PPpp")}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent API Keys */}
      <Card>
        <CardHeader>
          <CardTitle>Recent API Keys</CardTitle>
          <CardDescription>Most recently created API keys for this portal</CardDescription>
        </CardHeader>
        <CardContent>
          {keysData && keysData.items.length > 0 ? (
            <div className="space-y-4">
              {keysData.items.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{key.key_name}</p>
                      <StatusBadge status={key.is_active} showIcon={false} />
                    </div>
                    <p className="text-muted-foreground font-mono text-sm">{key.key_prefix}...</p>
                    <div className="text-muted-foreground flex items-center gap-4 text-xs">
                      <span>Environment: {key.environment}</span>
                      <span>Created: {format(new Date(key.created_at), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground py-8 text-center">
              No API keys found for this portal
            </div>
          )}
        </CardContent>
      </Card>

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
