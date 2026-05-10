import * as React from "react"
import { cn } from "./Button"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Refined card: softer border, lighter shadow, gentle hover lift
      "rounded-xl border border-slate-200/70 bg-white text-slate-900",
      "shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
      "transition-all duration-200 ease-out",
      "hover:shadow-[0_8px_24px_rgba(15,23,42,0.06),0_2px_6px_rgba(15,23,42,0.04)]",
      "hover:border-slate-200",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

export { Card }
