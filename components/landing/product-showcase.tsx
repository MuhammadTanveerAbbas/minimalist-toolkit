import { Check, Command } from "lucide-react"
import { TOOLS } from "@/lib/navigation"

/**
 * Static art board for the hero, deliberately free of charts. It reads as a
 * real workspace index: one account, every tool, each with its own icon.
 */
export function ProductShowcase() {
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xl">
        {/* Window chrome */}
        <div className="flex items-center gap-3 border-b border-border bg-surface-2 px-3 py-2.5">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
          </div>
          <span className="truncate rounded-md bg-background px-2 py-1 font-mono text-[10px] text-muted-foreground">
            app.minimalist-toolkit.app
          </span>
          <span className="ml-auto hidden rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground sm:inline">
            Preview
          </span>
        </div>

        <div className="grid min-h-[320px] grid-cols-[48px_minmax(0,1fr)] sm:grid-cols-[156px_minmax(0,1fr)]">
          {/* Rail */}
          <div className="border-r border-border bg-surface-2 p-2 sm:p-2.5">
            <div className="mb-3 hidden items-center gap-2 px-1.5 sm:flex">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground text-background">
                <Command className="h-3 w-3" aria-hidden="true" />
              </span>
              <span className="truncate text-[11px] font-semibold">Toolkit</span>
            </div>
            <ul className="space-y-1" aria-label="Tools">
              {TOOLS.map((tool, index) => {
                const Icon = tool.icon
                return (
                  <li
                    key={tool.id}
                    className={
                      index === 0
                        ? "flex items-center gap-2 rounded-md bg-foreground px-2 py-1.5 text-[10px] text-background sm:text-[11px]"
                        : "flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] text-muted-foreground sm:text-[11px]"
                    }
                  >
                    <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
                    <span className="hidden truncate sm:inline">{tool.name}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Panel */}
          <div className="min-w-0 bg-background">
            <div className="flex items-end justify-between gap-3 border-b border-border px-3 py-2.5 sm:px-4">
              <div className="min-w-0">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                  Workspace index
                </p>
                <p className="mt-1 truncate text-sm font-semibold tracking-tight sm:text-base">
                  Six tools, one account
                </p>
              </div>
              <span className="shrink-0 rounded-md border border-border bg-card px-2 py-1 text-[9px] text-muted-foreground">
                Private
              </span>
            </div>

            <ul className="divide-y divide-border">
              {TOOLS.map((tool, index) => {
                const Icon = tool.icon
                return (
                  <li key={tool.id} className="flex items-center gap-3 px-3 py-2 sm:px-4">
                    <span className="w-4 shrink-0 font-mono text-[9px] tabular-nums text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-card"
                      style={{ color: tool.accent }}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-medium sm:text-xs">{tool.name}</span>
                      <span className="hidden truncate text-[10px] text-muted-foreground sm:block">
                        {tool.tagline}
                      </span>
                    </span>
                    {index === 0 ? (
                      <span className="flex shrink-0 items-center gap-1 rounded-md bg-brand-soft px-1.5 py-0.5 text-[9px] font-medium text-brand-contrast">
                        <Check className="h-2.5 w-2.5" aria-hidden="true" />
                        Ready
                      </span>
                    ) : (
                      <span className="hidden shrink-0 text-[10px] text-muted-foreground sm:block">Open</span>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
