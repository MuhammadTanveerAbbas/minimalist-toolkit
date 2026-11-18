import { TOOLS } from "@/lib/navigation"

/** Static tool strip under the hero. Names come from the real tool list. */
export function ToolMarquee() {
  return (
    <div className="border-t border-border bg-surface-2" role="region" aria-label="Included tools">
      <ul className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
        {TOOLS.map((tool) => {
          const Icon = tool.icon
          return (
            <li key={tool.id} className="flex min-w-0 items-center gap-2">
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="text-xs font-medium">{tool.name}</span>
              <span className="hidden text-xs text-muted-foreground sm:inline">{tool.tagline}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
