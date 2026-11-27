import Link from "next/link"
import { TOOLS } from "@/lib/navigation"
import { MessageSquareText, Sparkles } from "lucide-react"

export function BentoGrid() {
  return (
    <section id="tools" className="border-b border-border scroll-mt-16">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl">
          <p className="text-xs font-semibold text-brand">The toolkit</p>
          <h2 className="mt-3 text-balance-tight text-3xl font-semibold tracking-tight sm:text-4xl">
            Every tool has one job, and does it properly
          </h2>
          <p className="mt-4 text-pretty text-base leading-7 text-muted-foreground">
            No chat box wrapped around a feature. Each of these is a focused workspace you can finish a
            task in, then get back to what you were doing.
          </p>
        </div>

        {/* Grid: 1 col → 2 col md → 6 col lg */}
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
          <BentoCard className="md:col-span-2 lg:col-span-4" tool={TOOLS[0]} visual={<SnippetVisual />} />
          <BentoCard className="md:col-span-2 lg:col-span-2" tool={TOOLS[1]} visual={<PromptCraftVisual />} />
          <BentoCard className="md:col-span-2 lg:col-span-6" tool={TOOLS[2]} visual={<ChatVisual />} wide />
          <BentoCard className="md:col-span-2 lg:col-span-3" tool={TOOLS[3]} visual={<PlaygroundVisual />} />
          <BentoCard className="md:col-span-2 lg:col-span-3" tool={TOOLS[4]} visual={<NewsVisual />} />
        </div>
      </div>
    </section>
  )
}

function BentoCard({
  tool,
  visual,
  className,
  wide,
}: {
  tool: (typeof TOOLS)[number]
  visual: React.ReactNode
  className?: string
  wide?: boolean
}) {
  const Icon = tool.icon
  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-[color,background-color,border-color,opacity,box-shadow,transform] duration-200 hover:border-foreground/20 hover:shadow-md ${className ?? ""}`}
    >
      <div className={`flex flex-col gap-5 p-5 sm:p-6 ${wide ? "lg:flex-row lg:items-start lg:gap-10" : ""}`}>
        {/* Text */}
        <div className={`flex flex-col ${wide ? "lg:max-w-sm lg:shrink-0" : ""}`}>
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2"
              style={{ color: tool.accent }}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-sm font-semibold sm:text-base">{tool.name}</h3>
              <p className="text-xs text-muted-foreground">{tool.tagline}</p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-muted-foreground">{tool.description}</p>

          <ul className="mt-4 space-y-1.5">
            {tool.highlights.map((h) => (
              <li key={h} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: tool.accent }} aria-hidden="true" />
                {h}
              </li>
            ))}
          </ul>

          <Link
            href={tool.href}
            className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent"
          >
            Open {tool.name}
          </Link>
        </div>

        {/* Visual */}
        <div className="min-w-0 flex-1 rounded-xl border border-border bg-surface-2 p-4">
          {visual}
        </div>
      </div>
    </article>
  )
}

/* ── Visuals ─────────────────────────────────────────────────────────────── */

function SnippetVisual() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <div className="flex items-center gap-2 border-b border-border bg-surface-2 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-border" aria-hidden="true" />
        <span className="font-mono text-[10px] text-muted-foreground">useDebouncedValue.ts</span>
        <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">TypeScript</span>
      </div>
      <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[10px] leading-[1.8] sm:text-[11px]">
        <code>
          <span className="text-muted-foreground">{"export function "}</span>
          <span className="text-brand">{"useDebouncedValue"}</span>
          <span className="text-muted-foreground">{"<T>(value: T, delay = 250) {"}</span>
          {"\n  "}
          <span className="text-chart-3">{"const "}</span>
          <span className="text-foreground">{"[debounced, setDebounced]"}</span>
          <span className="text-muted-foreground">{" = "}</span>
          <span className="text-chart-3">{"useState"}</span>
          <span className="text-muted-foreground">{"(value)"}</span>
          {"\n  "}
          <span className="text-chart-3">{"useEffect"}</span>
          <span className="text-muted-foreground">{"(() => {"}</span>
          {"\n    "}
          <span className="text-chart-3">{"const "}</span>
          <span className="text-foreground">{"timer"}</span>
          <span className="text-muted-foreground">{" = "}</span>
          <span className="text-chart-3">{"setTimeout"}</span>
          <span className="text-muted-foreground">{"(() => "}</span>
          <span className="text-chart-3">{"setDebounced"}</span>
          <span className="text-muted-foreground">{"(value), delay)"}</span>
          {"\n    "}
          <span className="text-muted-foreground">{"return () => "}</span>
          <span className="text-chart-3">{"clearTimeout"}</span>
          <span className="text-muted-foreground">{"(timer)"}</span>
          {"\n  "}
          <span className="text-muted-foreground">{"}, [value, delay])"}</span>
          {"\n  "}
          <span className="text-muted-foreground">{"return debounced"}</span>
          {"\n}"}
        </code>
      </pre>
    </div>
  )
}

function PromptCraftVisual() {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-background p-3.5">
      <div className="flex flex-wrap gap-1.5">
        {["ChatGPT", "Claude", "Cursor"].map((chip, i) => (
          <span
            key={chip}
            className={
              i === 1
                ? "rounded-md bg-foreground px-2.5 py-1 text-[10px] font-medium text-background"
                : "rounded-md border border-border px-2.5 py-1 text-[10px] text-muted-foreground"
            }
          >
            {chip}
          </span>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-surface-2 p-3">
        <p className="text-[9px] text-muted-foreground">instructions</p>
        <p className="mt-1.5 text-[10px] leading-relaxed text-foreground/80">
          You are a senior product marketer. Write a launch announcement for a developer tool that turns
          prompts into mockups. Keep it under 120 words.
        </p>
      </div>
      <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
        <Sparkles className="h-3 w-3 shrink-0" aria-hidden="true" />
        Optimised for the Claude instruction format
      </div>
    </div>
  )
}

function ChatVisual() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-2.5 rounded-lg border border-border bg-background p-3.5">
        <div className="ml-auto max-w-[85%] rounded-xl rounded-tr-sm bg-foreground px-3 py-2 text-[10px] leading-relaxed text-background">
          How should I structure a pricing page for a free tier?
        </div>
        <div className="max-w-[90%] rounded-xl rounded-tl-sm border border-border bg-card px-3 py-2 text-[10px] leading-relaxed">
          Lead with the free tier, name the limit, then show the paid step-up. Three columns work best.
        </div>
        <div className="flex items-center gap-1.5 pt-0.5 text-[9px] text-muted-foreground">
          <MessageSquareText className="h-3 w-3 shrink-0" aria-hidden="true" />
          Short answers, streamed as they arrive
        </div>
      </div>
      <div className="flex flex-col justify-center gap-2.5 rounded-lg border border-border bg-background p-3.5">
        {TOOLS[2].highlights.map((h, i) => (
          <div key={h} className="flex items-center gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-surface-2 font-mono text-[9px] font-semibold text-muted-foreground">
              {i + 1}
            </span>
            <span className="text-[11px] text-foreground/80">{h}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PlaygroundVisual() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {["Model A", "Model B"].map((label, index) => (
        <div key={label} className="space-y-2.5 rounded-lg border border-border bg-background p-3.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-muted-foreground">{label}</span>
            <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
              {index === 0 ? "Groq" : "OpenRouter"}
            </span>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 p-2.5">
            <p className="text-[10px] leading-relaxed">
              {index === 0
                ? "Use a short prompt. Name the format, the audience and the length."
                : "List the constraints first, then ask for three short alternatives."}
            </p>
          </div>
          <div className="flex items-center justify-between font-mono text-[9px] text-muted-foreground">
            <span>{index === 0 ? "182 ms" : "640 ms"}</span>
            <span>{index === 0 ? "43 tokens" : "51 tokens"}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function NewsVisual() {
  const rows = [
    { source: "HN", title: "A new open-weight model lands with a longer context window", meta: "2h ago" },
    { source: "arXiv", title: "Paper: routing between small models for long documents", meta: "4h ago" },
    { source: "GitHub", title: "repo: agent-eval-kit passes 10k stars this week", meta: "6h ago" },
  ]
  return (
    <div className="space-y-2 rounded-lg border border-border bg-background p-3.5">
      {rows.map((row) => (
        <div key={row.title} className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
          <span className="w-12 shrink-0 font-mono text-[9px] text-muted-foreground">{row.source}</span>
          <span className="min-w-0 flex-1 truncate text-[10px]">{row.title}</span>
          <span className="shrink-0 font-mono text-[9px] text-muted-foreground">{row.meta}</span>
        </div>
      ))}
    </div>
  )
}
