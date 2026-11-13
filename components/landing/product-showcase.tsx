import {
  BarChart3,
  Code2,
  Command,
  FileText,
  MessageSquareText,
  Plus,
  Search,
  Settings,
  Sparkles,
} from "lucide-react"

const SIDEBAR_SECTIONS = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", icon: BarChart3, active: false },
      { label: "Snippets", icon: Code2, active: true },
    ],
  },
  {
    label: "Create",
    items: [
      { label: "Mockify", icon: Sparkles, active: false },
      { label: "Quotes", icon: FileText, active: false },
    ],
  },
  {
    label: "Assist",
    items: [{ label: "AI Chat", icon: MessageSquareText, active: false }],
  },
]

const SNIPPET_ROWS = [
  { title: "use-debounce.ts", meta: "TypeScript · Updated today" },
  { title: "api-client.ts", meta: "TypeScript · 2 days ago" },
  { title: "button.tsx", meta: "React · Last week" },
]

/**
 * Hero workspace preview showing the app shell with a sidebar and main content.
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
            app.minimalist-toolkit.app/snippets
          </span>
          <span className="ml-auto hidden rounded-md border border-border bg-background px-2 py-1 text-[10px] text-muted-foreground sm:inline">
            Workspace
          </span>
        </div>

        <div className="flex h-[340px] bg-background sm:h-[360px]">
          <aside
            className="flex w-[132px] shrink-0 flex-col border-r border-border bg-sidebar sm:w-[148px]"
            aria-label="Workspace sidebar preview"
          >
            <div className="flex h-11 items-center gap-2 border-b border-border px-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
                <Command className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="truncate text-[11px] font-semibold tracking-tight">Toolkit</span>
            </div>

            <nav className="flex-1 overflow-hidden px-2 py-2.5">
              {SIDEBAR_SECTIONS.map((section) => (
                <div key={section.label} className="mb-2.5 last:mb-0">
                  <p className="px-2 pb-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {section.label}
                  </p>
                  <ul className="space-y-0.5">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      return (
                        <li key={item.label}>
                          <div
                            className={
                              item.active
                                ? "flex min-h-7 items-center gap-2 rounded-md bg-foreground px-2 text-[11px] font-medium text-background"
                                : "flex min-h-7 items-center gap-2 rounded-md px-2 text-[11px] text-muted-foreground"
                            }
                          >
                            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span className="truncate">{item.label}</span>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </nav>

            <div className="border-t border-border p-2">
              <div className="flex min-h-7 items-center gap-2 rounded-md px-2 text-[11px] text-muted-foreground">
                <Settings className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">Settings</span>
              </div>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex h-11 items-center justify-between gap-2 border-b border-border px-3">
              <div>
                <p className="text-xs font-medium leading-none">Snippets</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">Your private code library</p>
              </div>
              <span className="inline-flex h-7 items-center gap-1 rounded-md bg-foreground px-2 text-[10px] font-medium text-background">
                <Plus className="h-3 w-3" aria-hidden="true" />
                New
              </span>
            </div>

            <div className="flex-1 space-y-3 p-3">
              <div className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5">
                <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="truncate text-[11px] text-muted-foreground">Search snippets</span>
              </div>

              <ul className="space-y-2" aria-label="Snippet preview">
                {SNIPPET_ROWS.map((row, index) => (
                  <li
                    key={row.title}
                    className={
                      index === 0
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
