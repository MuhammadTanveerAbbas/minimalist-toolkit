"use client"

import { useState } from "react"
import {
  ArrowRight,
  Check,
  FileText,
  ImageIcon,
  Sparkles,
  Target,
  Terminal,
} from "lucide-react"
import { BarChart, CHART_COLORS, ComparisonBar, DonutChart } from "@/components/charts"
import { cn } from "@/lib/utils"

/**
 * Section 1 of 2 new landing sections.
 *
 * An interactive walkthrough of one real job: taking a client brief all the
 * way to a priced proposal. Each step swaps in its own visual so the
 * progression is legible rather than narrated.
 */

interface Step {
  id: string
  label: string
  tool: string
  icon: typeof Terminal
  headline: string
  body: string
  outcome: string
}

const STEPS: Step[] = [
  {
    id: "capture",
    label: "Capture the brief",
    tool: "Snippets",
    icon: Terminal,
    headline: "Drop the raw material in, structured",
    body: "Client requirements, API shapes, config snippets, the bits you will rewrite in a week. Save once with tags and a category and it is findable forever.",
    outcome: "One place to look, not six browser tabs",
  },
  {
    id: "visualise",
    label: "Shape the concept",
    tool: "Mockify",
    icon: ImageIcon,
    headline: "See the idea before you build it",
    body: "Turn the written brief into a visual. Compare aspect ratios, keep the good ones in history, and stop describing a mockup that nobody has seen.",
    outcome: "Fewer rounds of describing, more rounds of deciding",
  },
  {
    id: "prompt",
    label: "Write the prompt",
    tool: "PromptCraft",
    icon: Sparkles,
    headline: "Prompt for the model you are actually using",
    body: "Every model wants a different shape of instruction. Generate for the target, scrape the reference page into context, then refine what came back.",
    outcome: "Fewer retries, sharper first drafts",
  },
  {
    id: "price",
    label: "Price the work",
    tool: "Quotes",
    icon: FileText,
    headline: "Line items, tax, deposit, terms",
    body: "Build the quote with the same discipline you would apply to code. Tax and discount are computed, the balance after deposit is explicit, and a quote converts to an invoice in one step.",
    outcome: "A number the client can actually approve",
  },
  {
    id: "prioritise",
    label: "Decide what is next",
    tool: "Prioritizer",
    icon: Target,
    headline: "Defend the order with evidence",
    body: "Score the roadmap against weighted criteria, see which items are one assumption away from changing places, and export the reasoning rather than just the ranking.",
    outcome: "A decision you can explain on Monday",
  },
]

export function WorkflowShowcase() {
  const [active, setActive] = useState(0)
  const step = STEPS[active]
  const Icon = step.icon

  return (
    <section id="workflow" className="scroll-mt-16 border-b border-border bg-surface-2">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">Workflow</p>
          <h2 className="mt-3 text-balance-tight text-3xl font-semibold tracking-tight sm:text-4xl">
            Follow one job across the whole toolkit
          </h2>
          <p className="mt-4 text-pretty text-base leading-7 text-muted-foreground">
            Most tools handle a single step and leave you to move the work somewhere else by hand. These five
            steps are one continuous piece of work, and the output of each one feeds the next.
          </p>
        </div>

        {/* Step rail */}
        <div className="mt-10 grid gap-3 md:grid-cols-5 md:gap-2">
          {STEPS.map((item, index) => {
            const ItemIcon = item.icon
            const isActive = index === active
            const isDone = index < active
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(index)}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "group flex min-h-[76px] flex-col justify-between gap-2 rounded-lg border p-3 text-left transition-all duration-200",
                  isActive
                    ? "border-foreground bg-card shadow-sm"
                    : "border-border bg-card/60 hover:border-foreground/30 hover:bg-card"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
                      isActive ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isDone ? (
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <ItemIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                  </span>
                  <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-xs font-medium leading-tight",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Active step detail */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <div className="flex flex-col rounded-xl border border-border bg-card p-5 sm:p-7">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-2">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="rounded-md border border-border bg-surface-2 px-2 py-1 text-[11px] font-medium text-muted-foreground">
                {step.tool}
              </span>
            </div>

            <h3 className="mt-5 text-balance-tight text-xl font-semibold tracking-tight sm:text-2xl">
              {step.headline}
            </h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              {step.body}
            </p>

            <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-border bg-surface-2 p-3.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
              <p className="text-sm font-medium leading-6">{step.outcome}</p>
            </div>

            <div className="mt-6 flex items-center gap-2 border-t border-border pt-5">
              <button
                type="button"
                onClick={() => setActive((prev) => Math.max(0, prev - 1))}
                disabled={active === 0}
                className="inline-flex min-h-10 items-center rounded-lg border border-border px-3 text-xs font-medium transition-colors hover:bg-accent disabled:opacity-40"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setActive((prev) => Math.min(STEPS.length - 1, prev + 1))}
                disabled={active === STEPS.length - 1}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-foreground px-3 text-xs font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                Next step
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
            <StepVisual index={active} />
          </div>
        </div>
      </div>
    </section>
  )
}

function StepVisual({ index }: { index: number }) {
  switch (index) {
    case 0:
      return <CaptureVisual />
    case 1:
      return <ConceptVisual />
    case 2:
      return <PromptVisual />
    case 3:
      return <PricingVisual />
    default:
      return <DecisionVisual />
  }
}

function CaptureVisual() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2">
        <Terminal className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        <span className="font-mono text-[10px] text-muted-foreground">
          search: <span className="text-foreground">auth middleware</span>
        </span>
        <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">3 results</span>
      </div>
      <ul className="space-y-2">
        {[
          { name: "withSession", lang: "TypeScript", tag: "auth", ver: "v3" },
          { name: "rotateRefreshToken", lang: "TypeScript", tag: "auth", ver: "v2" },
          { name: "sessionCookieSchema", lang: "SQL", tag: "db", ver: "v1" },
        ].map((row) => (
          <li
            key={row.name}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="truncate font-mono text-[11px]">{row.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {row.lang} · #{row.tag}
              </p>
            </div>
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
              {row.ver}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ConceptVisual() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "1:1", ratio: "square" },
          { label: "3:2", ratio: "landscape" },
          { label: "16:9", ratio: "wide" },
        ].map((opt, i) => (
          <div
            key={opt.ratio}
            className={
              i === 1
                ? "rounded-lg border-2 border-foreground p-2"
                : "rounded-lg border border-border p-2"
            }
          >
            <div
              className="rounded"
              style={{
                aspectRatio: opt.ratio === "square" ? "1" : opt.ratio === "landscape" ? "3/2" : "16/9",
                backgroundColor: `var(--chart-${i + 1})`,
              }}
            />
            <p className="mt-1.5 text-center text-[9px] text-muted-foreground">{opt.label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-surface-2 p-3">
        <p className="text-[10px] font-medium">History</p>
        <ul className="mt-2 space-y-1.5">
          {["Bottle, soft studio light", "Bottle, hard shadow", "Bottle, flat lay"].map((item, i) => (
            <li key={item} className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
              <span className="truncate">{item}</span>
              <span className="ml-auto shrink-0 tabular-nums">{i * 4 + 3}m ago</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function PromptVisual() {
  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-1.5">
        {["ChatGPT", "Claude", "Gemini", "Mistral", "Cursor", "Grok"].map((chip) => (
          <span
            key={chip}
            className="rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground"
          >
            {chip}
          </span>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-surface-2 p-3">
        <div className="mb-2 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
          <p className="text-[10px] font-medium">Launch announcement</p>
        </div>
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          &lt;instructions&gt;Write a 120-word launch post. Lead with the outcome, not the feature list. No
          hype.&lt;/instructions&gt;
        </p>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 p-2.5">
        <Sparkles className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
        <p className="text-[10px] text-muted-foreground">
          Scraped reference page added to context
        </p>
      </div>
    </div>
  )
}

function PricingVisual() {
  return (
    <div className="space-y-3">
      <ComparisonBar
        formatValue={(v) => `$${v.toFixed(2)}`}
        options={[
          { label: "Subtotal", value: 1620, color: "var(--chart-2)" },
          { label: "Tax (20%)", value: 324, color: "var(--chart-3)" },
          { label: "Deposit (30%)", value: 583.2, color: "var(--chart-5)" },
        ]}
      />
      <div className="rounded-lg border border-border bg-surface-2 p-3">
        <div className="flex items-baseline justify-between">
          <p className="text-[10px] text-muted-foreground">Balance due</p>
          <p className="text-lg font-semibold tabular-nums tracking-tight">$1,360.80</p>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono">Net 15</span>
          <span>Due 2026-03-18</span>
        </div>
      </div>
    </div>
  )
}

function DecisionVisual() {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-surface-2 p-3">
        <p className="mb-2 text-[10px] font-semibold">Rank under current assumptions</p>
        <BarChart
          data={[
            { label: "Usage-based billing", value: 82, color: CHART_COLORS[0] },
            { label: "Team workspaces", value: 67, color: CHART_COLORS[1] },
            { label: "Public API v2", value: 54, color: CHART_COLORS[2] },
          ]}
        />
      </div>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-lg border border-border bg-surface-2 p-3">
        <DonutChart
          size={64}
          thickness={10}
          data={[
            { label: "Reach", value: 30 },
            { label: "Impact", value: 30 },
            { label: "Confidence", value: 25 },
            { label: "Effort", value: 15 },
          ]}
        />
        <div>
          <p className="text-[10px] font-medium">Fragility check</p>
          <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
            Team workspaces moves two places if Confidence shifts 20%. One assumption is carrying the
            roadmap.
          </p>
        </div>
      </div>
    </div>
  )
}
