import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { IconType } from "react-icons";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type MetricCardProps = {
  title: string;
  value: ReactNode;
  subtitle?: string;
  icon: IconType | LucideIcon;
  iconClassName?: string;
  iconBgColor?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  isLoading?: boolean;
  animationDelay?: number;
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClassName = "text-primary",
  iconBgColor = "bg-primary/10",
  trend,
  isLoading = false,
  animationDelay = 0,
}: MetricCardProps) {
  if (isLoading) {
    return (
      <Card className="glass-card animate-scale-in" style={{ animationDelay: `${animationDelay}ms` }}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
            <Skeleton className="h-11 w-11 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card animate-scale-in transition-all duration-300 hover:shadow-lg hover:shadow-indigo-400/10 hover:border-indigo-200" style={{ animationDelay: `${animationDelay}ms` }}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-muted-foreground mb-2 text-sm">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold">{value}</h3>
              {trend && (
                <span
                  className={`text-sm font-medium ${trend.isPositive ? "text-indigo-600" : "text-rose-500"
                    }`}
                >
                  {trend.value}
                </span>
              )}
            </div>
            {subtitle && <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>}
          </div>
          <div className={`rounded-full p-3 transition-all duration-200 ${iconBgColor} group-hover:bg-primary/20`}>
            <Icon className={`h-5 w-5 transition-colors ${iconClassName}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
