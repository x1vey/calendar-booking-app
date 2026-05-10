import * as React from "react"
import { cn } from "./Button"

/**
 * Soft-paper card — matches Call Me wireframe aesthetic.
 * Cream background, warm dashed/soft border, gentle hover.
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-[14px] border-[1.4px] border-[#b8a98f] bg-[#fffaf0] text-[#2b2722]",
      "transition-all duration-200 ease-out",
      "hover:border-[#2b2722]",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

export { Card }
