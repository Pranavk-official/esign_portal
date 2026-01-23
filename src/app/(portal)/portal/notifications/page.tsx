"use client";

import { Bell, BellOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PortalNotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          Manage your notification preferences and view alerts
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notification Center</CardTitle>
          </div>
          <CardDescription>Stay updated with important alerts and messages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted mb-4 rounded-full p-4">
              <BellOff className="text-muted-foreground h-8 w-8" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No Notifications Yet</h3>
            <p className="text-muted-foreground mb-4 max-w-sm text-sm">
              You don't have any notifications at the moment. We'll notify you when there are
              important updates or actions that require your attention.
            </p>
            <Button variant="outline" disabled>
              Configure Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
