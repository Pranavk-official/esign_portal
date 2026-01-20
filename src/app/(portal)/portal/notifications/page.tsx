"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";

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
            <div className="rounded-full bg-muted p-4 mb-4">
              <BellOff className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Notifications Yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              You don't have any notifications at the moment. We'll notify you when there are important updates or actions that require your attention.
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
