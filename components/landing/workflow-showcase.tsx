"use client"

import { useState } from "react"
import {
  ArrowRight,
  Check,
  ImageIcon,
  Sparkles,
  Terminal,
} from "lucide-react"
import { BarChart, CHART_COLORS, ComparisonBar } from "@/components/charts"
import { cn } from "@/lib/utils"

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
]

export function WorkflowShowcase() {
  const [active, setActive] = useState(0)
  const step = STEPS[active]
  const Icon = step.icon

  return (
    <section id="workflow" className="scroll-mt-16 border-b border-border bg-surface-2">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">Workflow</p>
          <h2 className="mt-3 text-balance-tight text-3xl font-semibold tracking-tight sm:text-4xl">
            Follow one job across the whole toolkit
          </h2>
          <p className="mt-4 text-pretty text-base leading-7 text-muted-foreground">
            Most tools handle a single step and leave you to move the work somewhere else by hand. These three
            steps are one continuous piece of work, and the output of each one feeds the next.
          </p>
        </div>

        {/* Step rail */}
        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
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
                  "group flex flex-col gap-3 rounded-xl border p-4 text-left transition-all duration-200",
                  isActive
                    ? "border-foreground bg-card shadow-sm"
                    : "border-border bg-card/60 hover:border-foreground/30 hover:bg-card"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
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
                    "text-sm font-medium leading-snug",
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
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          {/* Left: description */}
          <div className="flex flex-col rounded-2xl border border-border bg-card p-6 sm:p-7">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-2">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="rounded-lg border border-border bg-surface-2 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {step.tool}
              </span>
            </div>

            <h3 className="mt-5 text-balance-tight text-xl font-semibold tracking-tight sm:text-2xl">
              {step.headline}
            </h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              {step.body}
            </p>

            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-border bg-surface-2 p-4">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
              <p className="text-sm font-medium leading-6">{step.outcome}</p>
            </div>

            <div className="mt-6 flex items-center gap-2 border-t border-border pt-5">
              <button
                type="button"
                onClick={() => setActive((prev) => Math.max(0, prev - 1))}
                disabled={active === 0}
                className="inline-flex min-h-10 items-center rounded-lg border border-border px-4 text-xs font-medium transition-colors hover:bg-accent disabled:opacity-40"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setActive((prev) => Math.min(STEPS.length - 1, prev + 1))}
                disabled={active === STEPS.length - 1}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-foreground px-4 text-xs font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                Next step
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Right: visual */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
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
    default:
      return <DecisionVisual />
  }
}

function CaptureVisual() {
  const snippets = [
    { name: "withSession", lang: "TypeScript", tag: "#auth", ver: "v3" },
    { name: "rotateRefreshToken", lang: "TypeScript", tag: "#auth", ver: "v2" },
    { name: "sessionCookieSchema", lang: "SQL", tag: "#db", ver: "v1" },
  ]

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2.5">
        <Terminal className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className="font-mono text-[11px] text-muted-foreground">
          search:{" "}
          <span className="text-foreground">auth middleware</span>
        </span>
        <span className="ml-auto shrink-0 rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
          3 results
        </span>
      </div>

      {/* Snippet list */}
      <ul className="space-y-2">
        {snippets.map((row, i) => (
          <li
            key={row.name}
            className={cn(
              "flex items-center justify-between gap-3 rounded-xl border px-4 py-3",
              i === 0 ? "border-foreground/20 bg-card" : "border-border bg-surface-2"
            )}
          >
            <div className="min-w-0">
              <p className="truncate font-mono text-[11px] font-medium">{row.name}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                {row.lang} · {row.tag}
              </p>
            </div>
            <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 font-mono text-[9px] font-medium text-muted-foreground">
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
                ? "rounded-xl border-2 border-foreground p-2"
                : "rounded-xl border border-border p-2"
            }
          >
            <div
              className="rounded-md"
              style={{
                aspectRatio: opt.ratio === "square" ? "1" : opt.ratio === "landscape" ? "3/2" : "16/9",
                backgroundColor: `var(--chart-${i + 1})`,
              }}
            />
            <p className="mt-1.5 text-center text-[9px] text-muted-foreground">{opt.label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-surface-2 p-3.5">
        <p className="text-[10px] font-semibold">History</p>
        <ul className="mt-2 space-y-1.5">
          {["Bottle, soft studio light", "Bottle, hard shadow", "Bottle, flat lay"].map((item, i) => (
            <li key={item} className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
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
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {["ChatGPT", "Claude", "Gemini", "Mistral", "Cursor", "Grok"].map((chip) => (
          <span
            key={chip}
            className="rounded-md border border-border px-2.5 py-1 text-[10px] text-muted-foreground"
          >
            {chip}
          </span>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-surface-2 p-3.5">
        <div className="mb-2 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
          <p className="text-[10px] font-semibold">Launch announcement</p>
        </div>
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          {"<instructions>"}Write a 120-word launch post. Lead with the outcome, not the feature list. No
          hype.{"</instructions>"}
        </p>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 p-3">
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden="true" />
        <p className="text-[10px] text-muted-foreground">Scraped reference page added to context</p>
      </div>
    </div>
  )
}

function DecisionVisual() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-surface-2 p-3.5">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Rank stability
        </p>
        <BarChart
          data={[
            { label: "Usage-based billing", value: 82, color: CHART_COLORS[0] },
            { label: "Team workspaces", value: 67, color: CHART_COLORS[1] },
            { label: "Public API v2", value: 54, color: CHART_COLORS[2] },
            { label: "Mobile dashboard", value: 38, color: CHART_COLORS[3] },
          ]}
        />
      </div>
      <div className="rounded-xl border border-border bg-surface-2 p-3.5">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Range if inputs move 20%
        </p>
        <ComparisonBar
          options={[
            { label: "Usage-based billing", value: 82, color: "var(--chart-5)" },
            { label: "Team workspaces", value: 67, color: "var(--chart-1)" },
          ]}
        />
        <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
          Wider ranges show which items are most sensitive in planning.
        </p>
      </div>
    </div>
  )
}
