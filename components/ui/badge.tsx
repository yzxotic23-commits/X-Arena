import * as React from "react"
import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "outline"
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
          {
            "bg-primary/20 text-primary border border-primary/50": variant === "default",
            "bg-green-500/20 text-green-400 border border-green-500/50": variant === "success",
            "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50": variant === "warning",
            "bg-red-500/20 text-red-400 border border-red-500/50": variant === "danger",
            "bg-transparent text-foreground-primary border border-card-border": variant === "outline",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
export type { BadgeProps }

