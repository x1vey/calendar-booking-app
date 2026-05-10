import * as React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Soft-paper pill button — matches Call Me wireframe aesthetic.
 * Pill-shaped, ink-brown primary, peach accent, ghost variant.
 */
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "danger" | "ghost" | "outline"
    size?: "sm" | "md" | "lg"
  }
>(({ className, variant = "primary", size = "md", ...props }, ref) => {
  const variants = {
    // Primary: filled ink-brown pill
    primary:
      "bg-[#2b2722] text-[#f6f1e8] border-[1.4px] border-[#2b2722] " +
      "hover:bg-[#5a5249] hover:border-[#5a5249] hover:-translate-y-px active:translate-y-0",

    // Secondary: cream pill with soft border
    secondary:
      "bg-[#fffaf0] text-[#2b2722] border-[1.4px] border-[#b8a98f] " +
      "hover:border-[#2b2722] hover:bg-[#efe7d7]",

    // Danger: terracotta accent
    danger:
      "bg-[#b8714e] text-[#fffaf0] border-[1.4px] border-[#2b2722] " +
      "hover:bg-[#9c5e3f] hover:-translate-y-px active:translate-y-0",

    // Ghost: transparent, subtle hover
    ghost:
      "bg-transparent text-[#2b2722] border-[1.4px] border-transparent " +
      "hover:bg-[#efe7d7]",

    // Outline: peach accent ring
    outline:
      "bg-transparent text-[#2b2722] border-[1.4px] border-[#2b2722] " +
      "hover:bg-[oklch(0.74_0.10_55)]",
  }
  const sizes = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-10 px-5 text-sm gap-2",
    lg: "h-12 px-7 text-base gap-2",
  }

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold tracking-tight",
        "transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.62_0.10_25)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f1e8]",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
