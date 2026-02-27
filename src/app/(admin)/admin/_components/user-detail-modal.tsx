"use client";

import { format } from "date-fns";
import { Calendar, Mail, Shield, User } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-users";

interface UserDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

export function UserDetailModal({ open, onOpenChange, userId }: UserDetailModalProps) {
  const { data: user, isLoading } = useUser(userId || "");

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : user ? (
          <div className="space-y-4">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-700 text-xl font-bold text-white">
                    {user.email
                      .split("@")[0]
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-lg font-semibold text-gray-900">{user.email}</span>
                    </div>
                    <div className="mt-1">
                      <StatusBadge status={user.is_active} showIcon={true} />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-sm font-medium text-gray-600">User ID</div>
                    <div className="mt-1 font-mono text-xs text-gray-900">{user.id}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600">Portal ID</div>
                    <div className="mt-1 font-mono text-xs text-gray-900">
                      {user.portal_id || "Not assigned"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Roles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4" />
                  Roles & Permissions
                </CardTitle>
                <CardDescription>User roles and access levels</CardDescription>
              </CardHeader>
              <CardContent>
                {user.roles && user.roles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.roles.map((role) => (
                      <Badge
                        key={role.id}
                        variant="outline"
                        className="px-3 py-1 text-sm font-medium"
                      >
                        {role.name === "super_admin" && "🔐 "}
                        {role.name === "portal_admin" && "👑 "}
                        {role.name === "portal_user" && "👤 "}
                        {role.name
                          .split("_")
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ")}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No roles assigned</div>
                )}

                {user.roles && user.roles.some((r) => r.description) && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      {user.roles
                        .filter((r) => r.description)
                        .map((role) => (
                          <div key={role.id} className="text-sm">
                            <span className="font-medium text-gray-700">{role.name}:</span>{" "}
                            <span className="text-gray-600">{role.description}</span>
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Timestamps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-sm font-medium text-gray-600">Created At</div>
                    <div className="mt-1 text-sm text-gray-900">
                      {format(new Date(user.created_at), "PPpp")}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-600">Account Status</div>
                    <div className="mt-1 text-sm font-semibold text-gray-900">
                      {user.is_active ? (
                        <span className="text-green-600">Active</span>
                      ) : (
                        <span className="text-red-600">Inactive</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">No user selected</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
