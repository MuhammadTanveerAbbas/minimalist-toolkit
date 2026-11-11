import { Asterisk } from "lucide-react"
import { TOOLS } from "@/lib/navigation"

/**
 * Infinite moving strip. The track is duplicated so the loop is seamless;
 * the second copy is hidden from assistive tech.
 */
export function ToolMarquee() {
  return (
    <div
      className="marquee group relative overflow-hidden border-t border-border bg-surface-2"
      role="region"
      aria-label="Included tools"
    >
      <div className="marquee-track flex w-max">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            className="flex items-center gap-7 py-3 pr-7 sm:gap-9 sm:py-3.5 sm:pr-9"
            aria-hidden={copy === 1 ? true : undefined}
          >
            {TOOLS.map((tool) => {
              const Icon = tool.icon
              return (
                <li key={`${copy}-${tool.id}`} className="flex items-center gap-2.5 whitespace-nowrap">
                  <Icon className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                  <span className="text-xs font-medium tracking-tight text-foreground sm:text-sm">
                    {tool.name}
                  </span>
                  <span className="hidden text-[11px] text-muted-foreground sm:inline">{tool.tagline}</span>
                  <Asterisk className="ml-5 h-3 w-3 shrink-0 text-border sm:ml-7" aria-hidden="true" />
                </li>
              )
            })}
          </ul>
        ))}
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-surface-2 sm:w-20"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-surface-2 sm:w-20"
        aria-hidden="true"
      />
    </div>
  )
}

/**
 * Oversized moving text band used between sections. Same seamless loop as the
 * tool strip, with a slower pace so it reads rather than races.
 */
export function TextBand() {
  return (
    <div className="marquee overflow-hidden border-b border-border bg-foreground py-4 text-background sm:py-5">
      <div className="marquee-track marquee-track-slow flex w-max">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            className="flex items-center gap-8 pr-8 sm:gap-12 sm:pr-12"
            aria-hidden={copy === 1 ? true : undefined}
          >
            {TOOLS.map((tool) => (
              <li key={`${copy}-${tool.id}`} className="flex items-center gap-8 sm:gap-12">
                <span className="whitespace-nowrap text-2xl font-semibold uppercase tracking-tight sm:text-4xl">
                  {tool.name}
                </span>
                <Asterisk className="h-5 w-5 shrink-0 text-brand sm:h-7 sm:w-7" aria-hidden="true" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}
