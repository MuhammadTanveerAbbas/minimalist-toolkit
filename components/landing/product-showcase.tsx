import {
  BarChart3,
  Code2,
  MessageSquareText,
  Plus,
  Search,
  Settings,
  Sparkles,
} from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"

const PREVIEW_NAV = [
  { label: "Analytics", icon: BarChart3, active: false },
  { label: "Chat", icon: MessageSquareText, active: false },
  { label: "Snippets", icon: Code2, active: true },
  { label: "Mockify", icon: Sparkles, active: false },
  { label: "Settings", icon: Settings, active: false },
]

const SNIPPET_ROWS = [
  { title: "use-debounce.ts", meta: "TypeScript · Updated today" },
  { title: "api-client.ts", meta: "TypeScript · 2 days ago" },
  { title: "button.tsx", meta: "React · Last week" },
]

/**
 * Hero workspace preview showing the top bar, the pill navigation and a
 * snippet list. Matches the shell used inside the app.
 */
export function ProductShowcase() {
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {/* Window chrome */}
        <div className="flex items-center gap-3 border-b border-border bg-surface-2 px-3 py-2.5">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
          </div>
          <span className="truncate rounded-md bg-background px-2 py-1 font-mono text-[10px] text-muted-foreground">
            app.minimalist-toolkit.app/snippets
          </span>
          <span className="ml-auto hidden rounded-md border border-border bg-background px-2 py-1 text-[10px] text-muted-foreground sm:inline">
            Workspace
          </span>
        </div>

        <div className="flex h-[300px] flex-col bg-background sm:h-[340px] lg:h-[360px]">
          <div className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-border px-3">
            <div className="flex min-w-0 items-center gap-2">
              <BrandLogo size={24} />
              <span className="hidden truncate text-[11px] font-semibold tracking-tight sm:block">Minimalist Toolkit</span>
            </div>
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-brand-foreground"
              aria-hidden="true"
            >
              S
            </span>
          </div>

          <nav
            aria-label="Workspace pages preview"
            className="flex shrink-0 items-center gap-1 border-b border-border px-3 py-2"
          >
            {PREVIEW_NAV.map((item) => {
              const Icon = item.icon
              return (
                <span
                  key={item.label}
                  className={
                    item.active
                      ? "flex h-7 min-w-0 flex-1 items-center justify-center gap-1 rounded-md bg-foreground px-1 text-[10px] font-medium text-background"
                      : "flex h-7 min-w-0 flex-1 items-center justify-center gap-1 rounded-md px-1 text-[10px] text-muted-foreground"
                  }
                >
                  <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span className="sr-only truncate sm:not-sr-only sm:inline">{item.label}</span>
                </span>
              )
            })}
          </nav>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-border px-3">
              <div>
                <p className="text-xs font-medium leading-none">Snippets</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">Your private code library</p>
              </div>
              <span className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md bg-foreground px-2 text-[10px] font-medium text-background">
                <Plus className="h-3 w-3" aria-hidden="true" />
                New
              </span>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-hidden p-2.5 sm:p-3">
              <div className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5">
                <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="truncate text-[11px] text-muted-foreground">Search snippets</span>
              </div>

              <ul className="space-y-2" aria-label="Snippet preview">
                {SNIPPET_ROWS.map((row, index) => (
                  <li
                    key={row.title}
                    className={
                      index === 2
                        ? "hidden rounded-lg border border-border bg-card p-2.5 sm:block"
                        : index === 0
                          ? "rounded-lg border border-foreground/20 bg-card p-2.5"
                          : "rounded-lg border border-border bg-card p-2.5"
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-medium text-foreground">{row.title}</p>
                        <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{row.meta}</p>
                      </div>
                      {index === 0 ? (
                        <span className="shrink-0 rounded bg-secondary px-1.5 py-0.5 text-[9px] font-medium text-secondary-foreground">
                          Open
                        </span>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
