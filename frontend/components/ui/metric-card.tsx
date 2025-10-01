import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon?: LucideIcon
  className?: string
  description?: string
}

export function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  className,
  description,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-lg p-6 hover:border-primary/20 transition-all duration-300 group",
        "hover:glow-green-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {Icon && (
          <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        )}
      </div>

      {change && (
        <div className="mt-4 flex items-center">
          <span
            className={cn(
              "text-sm font-medium",
              changeType === "positive" && "text-primary",
              changeType === "negative" && "text-destructive",
              changeType === "neutral" && "text-muted-foreground",
            )}
          >
          
          </span>
          
        </div>
      )}
    </div>
  )
}
