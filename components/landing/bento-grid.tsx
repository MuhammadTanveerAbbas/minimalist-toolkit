import { BarChart, CHART_COLORS, DonutChart } from "@/components/charts"
import { TOOLS } from "@/lib/navigation"
import { Aperture, Camera, LayoutGrid, MessageSquareText, Scissors, Sparkles } from "lucide-react"

/**
 * Bento grid where every cell is a purpose-built component rather than a
 * repeated card. Each cell demonstrates a different capability using the
 * visual language that suits it.
 */
export function BentoGrid() {
  return (
    <section id="tools" className="border-b border-border scroll-mt-16">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">The toolkit</p>
          <h2 className="mt-3 text-balance-tight text-3xl font-semibold tracking-tight sm:text-4xl">
            Every tool has one job, and does it properly
          </h2>
          <p className="mt-4 text-pretty text-base leading-7 text-muted-foreground">
            No chat box wrapped around a feature. Each of these is a focused workspace you can finish a
            task in, then get back to what you were doing.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-6">
          {/* Row 1: Snippets (wide, code preview) + Quotes (document preview) */}
          <BentoCell
            className="md:col-span-4"
            tool={TOOLS[0]}
            visual={<SnippetVisual />}
          />
          <BentoCell
            className="md:col-span-2"
            tool={TOOLS[3]}
            visual={<QuoteVisual />}
          />

          {/* Row 2: Prioritizer (chart), Mockify (gallery), AI Chat (conversation) */}
          <BentoCell
            className="md:col-span-3"
            tool={TOOLS[4]}
            visual={<PrioritizerVisual />}
          />
          <BentoCell
            className="md:col-span-3"
            tool={TOOLS[1]}
            visual={<MockifyVisual />}
          />

          <BentoCell
            className="md:col-span-3"
            tool={TOOLS[2]}
            visual={<PromptCraftVisual />}
          />
          <BentoCell
            className="md:col-span-3"
            tool={TOOLS[5]}
            visual={<ChatVisual />}
          />
        </div>
      </div>
    </section>
  )
}

function BentoCell({
  tool,
  visual,
  className,
}: {
  tool: (typeof TOOLS)[number]
  visual: React.ReactNode
  className?: string
}) {
  const Icon = tool.icon
  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-foreground/20 ${className ?? ""}`}
    >
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border"
              style={{ color: tool.accent }}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold sm:text-base">{tool.name}</h3>
              <p className="truncate text-xs text-muted-foreground">{tool.tagline}</p>
            </div>
          </div>
        </div>

        <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">{tool.description}</p>

        <ul className="mt-4 grid gap-1.5 text-xs text-muted-foreground sm:grid-cols-2">
          {tool.highlights.map((highlight) => (
            <li key={highlight} className="flex items-start gap-1.5">
              <span
                className="mt-[7px] h-1 w-1 shrink-0 rounded-full"
                style={{ backgroundColor: tool.accent }}
                aria-hidden="true"
              />
              {highlight}
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-border bg-surface-2 p-4 sm:p-5">{visual}</div>
    </article>
  )
}

/* ── Cell visuals: each one a different component ───────────────────────── */

function SnippetVisual() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-border" aria-hidden="true" />
        <span className="font-mono text-[10px] text-muted-foreground">useDebouncedValue.ts</span>
        <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
          TypeScript
        </span>
      </div>
      <pre className="overflow-x-auto px-3 py-3 font-mono text-[10px] leading-[1.7] sm:text-[11px]">
        <code>
          <span className="text-muted-foreground">{"export function "}</span>
          <span className="text-brand">{"useDebouncedValue"}</span>
          <span className="text-muted-foreground">{"(value: T, delay = 250) {"}</span>
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

function QuoteVisual() {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-start justify-between gap-3 border-b border-border pb-2.5">
        <div className="min-w-0">
          <p className="font-mono text-[10px] text-muted-foreground">INV-2026-0043</p>
          <p className="truncate text-xs font-semibold">Acme Studio</p>
        </div>
        <span className="shrink-0 rounded-md bg-warning/15 px-1.5 py-0.5 text-[9px] font-medium text-warning">
          Due in 7 days
        </span>
      </div>
      <ul className="space-y-1.5 py-2.5">
        {[
          { label: "Design system audit", qty: "1 x 480", amount: "$480" },
          { label: "Component build (12h)", qty: "12 x 95", amount: "$1,140" },
        ].map((row) => (
          <li key={row.label} className="flex items-center justify-between gap-2 text-[10px]">
            <span className="min-w-0 flex-1 truncate">
              {row.label} <span className="text-muted-foreground">{row.qty}</span>
            </span>
            <span className="shrink-0 tabular-nums">{row.amount}</span>
          </li>
        ))}
      </ul>
      <div className="space-y-1 border-t border-border pt-2 text-[10px]">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="tabular-nums">$1,620.00</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Tax (20%)</span>
          <span className="tabular-nums">$324.00</span>
        </div>
        <div className="flex justify-between text-[11px] font-semibold">
          <span>Total</span>
          <span className="tabular-nums">$1,944.00</span>
        </div>
      </div>
    </div>
  )
}

function PrioritizerVisual() {
  const ranked = [
    { label: "Usage-based billing", value: 82 },
    { label: "Team workspaces", value: 67 },
    { label: "Public API v2", value: 54 },
    { label: "Mobile dashboard", value: 38 },
  ]
  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="rounded-lg border border-border bg-background p-3">
        <div className="mb-2.5 flex items-center justify-between">
          <p className="text-[10px] font-semibold">Weighted score</p>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">RICE</span>
        </div>
        <BarChart data={ranked.map((r, i) => ({ ...r, color: CHART_COLORS[i] }))} />
      </div>
      <div className="rounded-lg border border-border bg-background p-3">
        <p className="mb-1.5 text-[10px] font-semibold">Criteria weight</p>
        <DonutChart
          size={92}
          thickness={12}
          data={[
            { label: "Reach", value: 30 },
            { label: "Impact", value: 30 },
            { label: "Confidence", value: 25 },
            { label: "Effort", value: 15 },
          ]}
        />
      </div>
    </div>
  )
}

function MockifyVisual() {
  const tiles = [
    { label: "Studio shot", color: "var(--chart-3)", icon: Camera },
    { label: "Lifestyle", color: "var(--chart-2)", icon: Aperture },
    { label: "Flat lay", color: "var(--chart-4)", icon: LayoutGrid },
    { label: "On model", color: "var(--chart-5)", icon: Scissors },
  ]
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {tiles.map((tile) => {
        const Icon = tile.icon
        return (
          <figure key={tile.label} className="space-y-1.5">
            <div
              className="flex aspect-square items-center justify-center rounded-lg border border-border"
              style={{ backgroundColor: tile.color }}
              role="img"
              aria-label={`${tile.label} mockup placeholder`}
            >
              <Icon className="h-6 w-6 text-background/90" aria-hidden="true" />
            </div>
            <figcaption className="truncate text-[9px] text-muted-foreground">{tile.label}</figcaption>
          </figure>
        )
      })}
      <p className="col-span-2 mt-1 text-[10px] leading-relaxed text-muted-foreground sm:col-span-4">
        Illustrative placeholders. Mockify generates real images from your prompt and keeps them in a
        searchable history.
      </p>
    </div>
  )
}

function PromptCraftVisual() {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-background p-3">
      <div className="flex flex-wrap gap-1">
        {["ChatGPT", "Claude", "Cursor"].map((chip, i) => (
          <span
            key={chip}
            className={
              i === 1
                ? "rounded-md bg-foreground px-2 py-1 text-[9px] font-medium text-background"
                : "rounded-md border border-border px-2 py-1 text-[9px] text-muted-foreground"
            }
          >
            {chip}
          </span>
        ))}
      </div>
      <div className="rounded-md border border-border bg-card p-2.5">
        <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">instructions</p>
        <p className="mt-1 text-[10px] leading-relaxed text-foreground/80">
          You are a senior product marketer. Write a launch announcement for a developer tool that turns
          prompts into mockups. Keep it under 120 words.
        </p>
      </div>
      <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
        <Sparkles className="h-3 w-3" aria-hidden="true" />
        Optimised for the Claude instruction format
      </div>
    </div>
  )
}

function ChatVisual() {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-background p-3">
      <div className="ml-auto max-w-[80%] rounded-lg bg-foreground px-2.5 py-1.5 text-[10px] leading-relaxed text-background">
        How should I structure a pricing page for a free tier?
      </div>
      <div className="max-w-[88%] rounded-lg border border-border bg-card px-2.5 py-1.5 text-[10px] leading-relaxed">
        Lead with the free tier, name the limit, then show the paid step-up. Three columns work best.
      </div>
      <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
        <MessageSquareText className="h-3 w-3" aria-hidden="true" />
        Short answers, streamed as they arrive
      </div>
    </div>
  )
}
