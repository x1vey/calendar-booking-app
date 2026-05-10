import * as React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "danger" | "ghost" | "outline"
    size?: "sm" | "md" | "lg"
  }
>(({ className, variant = "primary", size = "md", ...props }, ref) => {
  const variants = {
    // Primary: indigo with subtle glow + lift on hover
    primary:
      "bg-indigo-600 text-white shadow-[0_2px_8px_rgba(99,102,241,0.25)] " +
      "hover:bg-indigo-500 hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(99,102,241,0.35)] " +
      "active:translate-y-0",
    // Secondary: clean white with crisp border
    secondary:
      "bg-white text-slate-900 border border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)] " +
      "hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-px active:translate-y-0",
    // Danger: rose, same lift treatment
    danger:
      "bg-rose-600 text-white shadow-[0_2px_8px_rgba(244,63,94,0.25)] " +
      "hover:bg-rose-500 hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(244,63,94,0.35)] " +
      "active:translate-y-0",
    // Ghost: minimal, gentle hover surface
    ghost:
      "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    // Outline: indigo accent ring
    outline:
      "bg-transparent border border-indigo-300 text-indigo-700 " +
      "hover:bg-indigo-50 hover:border-indigo-500",
  }
  const sizes = {
    sm: "h-8 px-3 text-xs gap-1.5",
    md: "h-10 px-4 py-2 text-sm gap-2",
    lg: "h-12 px-6 text-base gap-2",
  }

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-semibold tracking-tight " +
        "transition-all duration-200 ease-out " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 " +
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
