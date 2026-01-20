import { LucideIcon } from "lucide-react"
import { IconType } from "react-icons"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ReactNode } from "react"

type MetricCardProps = {
    title: string
    value: ReactNode
    subtitle?: string
    icon: IconType | LucideIcon
    iconClassName?: string
    iconBgColor?: string
    trend?: {
        value: string
        isPositive?: boolean
    }
    isLoading?: boolean
}

export function MetricCard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconClassName = "text-blue-600",
    iconBgColor = "bg-blue-100",
    trend,
    isLoading = false,
}: MetricCardProps) {
    if (isLoading) {
        return (
            <Card className="border-zinc-300">
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
        )
    }

    return (
        <Card className="border-zinc-300">
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground mb-2">{title}</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold">{value}</h3>
                            {trend && (
                                <span
                                    className={`text-sm font-medium ${trend.isPositive ? "text-green-600" : "text-red-600"
                                        }`}
                                >
                                    {trend.value}
                                </span>
                            )}
                        </div>
                        {subtitle && (
                            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                        )}
                    </div>
                    <div className={`rounded-full p-3 ${iconBgColor}`}>
                        <Icon className={`h-5 w-5 ${iconClassName}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
