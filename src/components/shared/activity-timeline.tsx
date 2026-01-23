"use client";

import { formatDistanceToNow } from "date-fns";
import { Activity, FileText, Key, Shield, User } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ActivityItem {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user_email?: string;
  timestamp: string;
  details?: Record<string, any>;
}

interface ActivityTimelineProps {
  activities: ActivityItem[];
  className?: string;
  isLoading?: boolean;
}

function getActivityIcon(entityType: string) {
  switch (entityType.toLowerCase()) {
    case "user":
      return User;
    case "api_key":
    case "key":
      return Key;
    case "portal":
      return Shield;
    case "document":
      return FileText;
    default:
      return Activity;
  }
}

function getActivityColor(action: string) {
  const lowerAction = action.toLowerCase();
  if (lowerAction.includes("create") || lowerAction.includes("add")) {
    return "text-green-600 dark:text-green-400";
  }
  if (
    lowerAction.includes("delete") ||
    lowerAction.includes("remove") ||
    lowerAction.includes("revoke")
  ) {
    return "text-red-600 dark:text-red-400";
  }
  if (
    lowerAction.includes("update") ||
    lowerAction.includes("edit") ||
    lowerAction.includes("modify")
  ) {
    return "text-blue-600 dark:text-blue-400";
  }
  return "text-gray-600 dark:text-gray-400";
}

export function ActivityTimeline({ activities, className }: ActivityTimelineProps) {
  if (!activities || activities.length === 0) {
    return <div className="text-muted-foreground py-8 text-center">No activity recorded yet</div>;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {activities.map((activity, index) => {
        const Icon = getActivityIcon(activity.entity_type);
        const color = getActivityColor(activity.action);

        return (
          <div key={activity.id} className="relative flex gap-4">
            {/* Timeline line */}
            {index < activities.length - 1 && (
              <div className="bg-border absolute top-8 bottom-0 left-4 w-px" />
            )}

            {/* Icon */}
            <div
              className={cn(
                "bg-background relative flex h-8 w-8 items-center justify-center rounded-full border",
                color
              )}
            >
              <Icon className="h-4 w-4" />
            </div>

            {/* Content */}
            <div className="flex-1 space-y-1 pb-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm leading-none font-medium">{activity.action}</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {activity.entity_type} · {activity.entity_id}
                  </p>
                  {activity.user_email && (
                    <p className="text-muted-foreground mt-1 text-xs">by {activity.user_email}</p>
                  )}
                  {activity.details && Object.keys(activity.details).length > 0 && (
                    <div className="text-muted-foreground mt-2 text-xs">
                      {Object.entries(activity.details).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-muted-foreground text-xs whitespace-nowrap">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
