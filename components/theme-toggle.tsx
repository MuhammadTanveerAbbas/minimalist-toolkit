"use client"

import { Monitor, Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"
import { useTheme } from "@/hooks/use-theme"
import { THEMES, type Theme } from "@/lib/theme"
import { cn } from "@/lib/utils"

const ICONS: Record<Theme, React.ElementType> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

/**
 * Three way theme control: an explicit light or dark choice, or follow the
 * operating system.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn("flex gap-1 rounded-lg border border-border bg-card p-1", className)}
    >
      {THEMES.map((option) => {
        const Icon = ICONS[option.value]
        const active = theme === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(option.value)}
            className={cn(
              "inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors duration-150",
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Compact icon button for the workspace header. Cycles light and dark.
 */
export function ThemeIconButton({ className }: { className?: string }) {
  const { isDark, toggle } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const Icon = mounted && isDark ? Moon : Sun
  const label = mounted
    ? isDark
      ? "Switch to light theme"
      : "Switch to dark theme"
    : "Toggle colour theme"

  return (
    <button
      type="button"
      onClick={toggle}
      title={label}
      aria-label={label}
      suppressHydrationWarning
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground",
        className
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  )
}
