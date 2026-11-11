"use client"

import { useState } from "react"
import { BarChart, CHART_COLORS, ComparisonBar, Sparkline } from "@/components/charts"
import { cn } from "@/lib/utils"

/**
 * Section 2 of 2 new landing sections.
 *
 * Real-world use cases and outcomes. Each persona is shown with the work it
 * replaces, the outcome it produces, and the evidence that the problem is
 * real. Citations point to published 2025 research, and the figures are
 * attributed rather than presented as the product's own metrics.
 */

interface Persona {
  id: string
  role: string
  context: string
  headline: string
  painPoint: string
  painStat: string
  painSource: string
  outcome: string
  outcomeLabel: string
  steps: { label: string; detail: string }[]
  chart: "inflow" | "comparison" | "trend"
}

const PERSONAS: Persona[] = [
  {
    id: "freelancer",
    role: "Independent freelancer",
    context: "One person, several clients, quotes sent by hand",
    headline: "Get paid on time by sending a quote the client can approve in one read",
    painPoint:
      "Late payment is the single biggest operational problem for freelancers, and most quote tools stop at the estimate. The gap is everything after: the invoice, the deposit, the balance.",
    painStat: "67.5% of UK freelancers reported late payment",
    painSource: "Leapers, Mental Health in Freelancing (2025, n=1,013)",
    outcome: "Quotes converted to invoices without retyping a line item",
    outcomeLabel: "Manual rework removed",
    steps: [
      { label: "Scope", detail: "Line items with quantity and rate" },
      { label: "Tax and terms", detail: "20% VAT, Net 15, deposit 30%" },
      { label: "Convert", detail: "Quote becomes an invoice in one click" },
      { label: "Send", detail: "Print to PDF or export CSV for your accountant" },
    ],
    chart: "inflow",
  },
  {
    id: "founder",
    role: "Early-stage founder",
    context: "Choosing what to build next, with two people and a long list",
    headline: "Stop arguing from taste and argue from numbers you can defend",
    painPoint:
      "Prioritisation frameworks get abandoned because their inputs are guesses and nobody records where the guesses came from. When a stakeholder disagrees, there is nothing to point at.",
    painStat: "73% of teams say data does not guide their roadmap",
    painSource: "Stickynessie roadmap survey (2025, vendor-reported)",
    outcome: "Every score carries its evidence and a fragility rating",
    outcomeLabel: "Decisions recorded, not remembered",
    steps: [
      { label: "Score", detail: "RICE, ICE, WSJF or your own weights" },
      { label: "Weigh", detail: "Adjust criteria and watch ranks move" },
      { label: "Stress test", detail: "Perturb inputs by 20% and see what breaks" },
      { label: "Export", detail: "A Markdown decision record, not a screenshot" },
    ],
    chart: "comparison",
  },
  {
    id: "developer",
    role: "Developer or small team",
    context: "Same boilerplate, rewritten every other project",
    headline: "Keep the code you know you will need again, and find it in seconds",
    painPoint:
      "Snippets scattered across gists, notes apps and chat history stop being useful within weeks. Without tags, categories and search, a snippet library becomes a graveyard.",
    painStat: "Only 16% of freelancers use dedicated invoicing or code tooling",
    painSource: "Freelancermap Freelancer Study (2025, n=3,571)",
    outcome: "Searchable, tagged, versioned code that survives the project",
    outcomeLabel: "Time to first reuse",
    steps: [
      { label: "Save", detail: "Title, language, tags, category" },
      { label: "Organise", detail: "Filter by language or visibility" },
      { label: "Iterate", detail: "Up to ten versions with restore" },
      { label: "Reuse", detail: "Copy or export the whole library" },
    ],
    chart: "trend",
  },
]

export function UseCases() {
  const [active, setActive] = useState(0)
  const persona = PERSONAS[active]

  return (
    <section id="use-cases" className="scroll-mt-16 border-b border-border">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">Use cases</p>
          <h2 className="mt-3 text-balance-tight text-3xl font-semibold tracking-tight sm:text-4xl">
            What people actually use this for
          </h2>
          <p className="mt-4 text-pretty text-base leading-7 text-muted-foreground">
            The same six tools land differently depending on what you do for a living. Here is what changes
            for the three most common situations, with the research behind the problem each one addresses.
          </p>
        </div>

        {/* Persona switcher */}
        <div
          role="tablist"
          aria-label="Use case by role"
          className="mt-10 flex flex-col gap-2 sm:flex-row sm:gap-3"
        >
          {PERSONAS.map((item, index) => (
            <button
              key={item.id}
              role="tab"
              type="button"
              aria-selected={index === active}
              onClick={() => setActive(index)}
              className={cn(
                "flex-1 rounded-lg border p-3.5 text-left transition-all duration-200",
                index === active
                  ? "border-foreground bg-card shadow-sm"
                  : "border-border bg-surface-2 hover:border-foreground/30 hover:bg-card"
              )}
            >
              <p
                className={cn(
                  "text-sm font-semibold",
                  index === active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {item.role}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.context}</p>
            </button>
          ))}
        </div>

        {/* Persona detail */}
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="flex flex-col rounded-xl border border-border bg-card p-5 sm:p-7">
            <h3 className="text-balance-tight text-xl font-semibold tracking-tight sm:text-2xl">
              {persona.headline}
            </h3>

            <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              {persona.painPoint}
            </p>

            {/* Evidence card */}
            <figure className="mt-6 rounded-lg border border-border bg-surface-2 p-4">
              <blockquote className="text-sm font-medium leading-6">{persona.painStat}</blockquote>
              <figcaption className="mt-2 text-xs text-muted-foreground">{persona.painSource}</figcaption>
            </figure>

            {/* Steps */}
            <ol className="mt-6 space-y-2.5">
              {persona.steps.map((step, index) => (
                <li key={step.label} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-[10px] tabular-nums text-muted-foreground">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{step.label}</p>
                    <p className="text-sm leading-6 text-muted-foreground">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>

            {/* Outcome */}
            <div className="mt-6 flex items-start gap-3 rounded-lg border border-brand/30 bg-brand/5 p-4">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand" aria-hidden="true" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-brand">
                  {persona.outcomeLabel}
                </p>
                <p className="mt-1 text-sm font-medium leading-6">{persona.outcome}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-2 p-4 sm:p-6">
            <PersonaVisual kind={persona.chart} />
          </div>
        </div>
      </div>
    </section>
  )
}

function PersonaVisual({ kind }: { kind: Persona["chart"] }) {
  if (kind === "inflow") {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-card p-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Quote to cash
          </p>
          <div className="mt-3 space-y-2">
            {[
              { label: "Quote sent", value: 100, color: "var(--chart-2)" },
              { label: "Accepted", value: 68, color: "var(--chart-3)" },
              { label: "Invoiced", value: 61, color: "var(--chart-1)" },
              { label: "Paid on time", value: 44, color: "var(--chart-5)" },
            ].map((row, index) => (
              <div key={row.label} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-[10px] text-muted-foreground">{row.label}</span>
                <div className="h-6 flex-1 overflow-hidden rounded-md bg-muted">
                  <div
                    className="flex h-full items-center justify-end rounded-md px-2 text-[9px] font-medium text-background transition-[width] duration-700"
                    style={{
                      width: `${row.value}%`,
                      backgroundColor: row.color,
                      transitionDelay: `${index * 80}ms`,
                    }}
                  >
                    {row.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
            Illustrative funnel shape based on the late-payment rates cited above. Not product telemetry.
          </p>
        </div>
      </div>
    )
  }

  if (kind === "comparison") {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-card p-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
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
        <div className="rounded-lg border border-border bg-card p-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Range if inputs move 20%
          </p>
          <ComparisonBar
            options={[
              { label: "Usage-based billing", value: 82, color: "var(--chart-5)" },
              { label: "Team workspaces", value: 67, color: "var(--chart-1)" },
            ]}
          />
          <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
            Team workspaces spans the widest range, so it is the item most likely to be contested in
            planning.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-card p-3.5">
        <div className="flex items-baseline justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Snippets reused
          </p>
          <p className="text-lg font-semibold tabular-nums tracking-tight">3.4x</p>
        </div>
        <Sparkline values={[4, 7, 6, 11, 9, 14, 18, 16, 23]} height={64} color="var(--chart-2)" />
        <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
          Once a snippet has been reused a few times, saving it becomes the fastest path in the project.
          Illustrative shape, not a measured metric.
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card p-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Where the time goes
        </p>
        <ul className="mt-2.5 space-y-1.5">
          {[
            { label: "Rewriting the same helper", width: 86 },
            { label: "Hunting for a saved snippet", width: 64 },
            { label: "Re-explaining context", width: 41 },
          ].map((row) => (
            <li key={row.label} className="flex items-center gap-3">
              <span className="w-28 shrink-0 truncate text-[10px] text-muted-foreground sm:w-44">{row.label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-chart-2 transition-[width] duration-700"
                  style={{ width: `${row.width}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
