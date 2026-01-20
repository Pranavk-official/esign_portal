import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type MetricCardProps = {
    title: string
    value: string | number
    subtitle?: string
    icon: LucideIcon
    iconClassName?: string
    trend?: {
        value: string
        isPositive?: boolean
    }
}

export function MetricCard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconClassName = "text-blue-600",
    trend,
}: MetricCardProps) {
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
                    <div className={`rounded-full p-3 bg-opacity-10 ${iconClassName.replace("text-", "bg-")}`}>
                        <Icon className={`h-5 w-5 ${iconClassName}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
