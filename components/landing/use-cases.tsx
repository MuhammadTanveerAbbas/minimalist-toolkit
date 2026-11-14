"use client"

import { useState } from "react"
import { Cookie, Database, KeyRound, Lock, ShieldCheck, Users } from "lucide-react"
import { BarChart, CHART_COLORS, ComparisonBar, Sparkline } from "@/components/charts"
import { cn } from "@/lib/utils"

interface Persona {
  id: string
  role: string
  context: string
  headline: string
  painStat: string
  painSource: string
  outcome: string
  outcomeLabel: string
  steps: string[]
  chart: "inflow" | "comparison" | "trend"
}

const PERSONAS: Persona[] = [
  {
    id: "founder",
    role: "Founder",
    context: "A small team choosing what to build",
    headline: "Rank ideas with scores you can explain and revisit.",
    painStat: "73% say data does not guide the roadmap",
    painSource: "Stickynessie, 2025",
    outcome: "Each decision keeps its scoring and tradeoffs.",
    outcomeLabel: "Clearer calls",
    steps: ["Score with RICE, ICE or WSJF", "Adjust weights", "Stress test inputs", "Export the decision"],
    chart: "comparison",
  },
  {
    id: "developer",
    role: "Developer",
    context: "Reusable code and workflows",
    headline: "Keep useful snippets and workflows ready for the next project.",
    painStat: "16% use dedicated tooling for repeat work",
    painSource: "Freelancermap, 2025 (n=3,571)",
    outcome: "Searchable snippets with versions when you need them.",
    outcomeLabel: "Faster reuse",
    steps: ["Save with tags", "Filter and search", "Version and restore", "Copy or export"],
    chart: "trend",
  },
]

const CONTROLS = [
  { icon: Database, title: "Account-owned data", body: "Work is scoped to your account." },
  { icon: Cookie, title: "Protected sessions", body: "Sessions use secure server cookies." },
  { icon: ShieldCheck, title: "Server checks", body: "Private routes verify access first." },
  { icon: KeyRound, title: "Secrets stay server-side", body: "Keys never ship to the browser." },
  { icon: Lock, title: "Auth safeguards", body: "Sign-in routes are rate limited." },
  { icon: Users, title: "Private workspace", body: "Only public pages are open." },
]

export function UseCases() {
  const [active, setActive] = useState(0)
  const persona = PERSONAS[active]

  return (
    <section id="use-cases" className="scroll-mt-16 border-b border-border bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {/* Header row */}
        <div className="flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-balance-tight text-3xl font-semibold tracking-tight sm:text-4xl">
              Built for real work, private by default
            </h2>
            <p className="mt-3 text-pretty text-base leading-7 text-muted-foreground">
              Choose a workflow, see the outcome, and review the data controls in the same place.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-6 self-start rounded-xl border border-border bg-surface-2 px-5 py-3.5">
            <div>
              <p className="text-xl font-semibold tabular-nums tracking-tight">3</p>
              <p className="text-xs text-muted-foreground">workflows</p>
            </div>
            <div className="h-8 w-px bg-border" aria-hidden="true" />
            <div>
              <p className="text-xl font-semibold tabular-nums tracking-tight">6</p>
              <p className="text-xs text-muted-foreground">data controls</p>
            </div>
          </div>
        </div>

        {/* Main card */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid lg:grid-cols-[200px_minmax(0,1fr)]">
            {/* Sidebar: persona tabs */}
            <div className="border-b border-border bg-surface-2 p-4 lg:border-b-0 lg:border-r">
              <p className="px-1 pb-3 text-xs font-semibold text-muted-foreground">Choose a workflow</p>
              <div role="tablist" aria-label="Workflow" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 lg:gap-2">
                {PERSONAS.map((item, index) => {
                  const selected = index === active
                  return (
                    <button
                      key={item.id}
                      role="tab"
                      type="button"
                      aria-selected={selected}
                      onClick={() => setActive(index)}
                      className={cn(
                        "group rounded-xl border px-4 py-3.5 text-left transition-colors outline-none",
                        selected
                          ? "border-brand/40 bg-card shadow-sm"
                          : "border-transparent bg-transparent hover:border-border hover:bg-card"
                      )}
                    >
                      <p className={cn("text-sm font-semibold", selected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
                        {item.role}
                      </p>
                      <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{item.context}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Content area */}
            <div className="grid xl:grid-cols-[minmax(0,1fr)_300px]">
              {/* Left: headline + pain/outcome + steps */}
              <div className="flex flex-col p-5 sm:p-6">
                <h3 className="max-w-xl text-balance-tight text-xl font-semibold tracking-tight sm:text-2xl">
                  {persona.headline}
                </h3>

                {/* Pain / outcome */}
                <div className="mt-5 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
                  <figure className="bg-card p-4 sm:p-5">
                    <p className="text-xs font-medium text-muted-foreground">Reported challenge</p>
                    <blockquote className="mt-2 text-sm font-semibold leading-6 sm:text-base">
                      {persona.painStat}
                    </blockquote>
                    <figcaption className="mt-1.5 text-xs text-muted-foreground">{persona.painSource}</figcaption>
                  </figure>
                  <div className="bg-brand/5 p-4 sm:p-5">
                    <p className="text-xs font-semibold text-brand">{persona.outcomeLabel}</p>
                    <p className="mt-2 text-sm font-medium leading-6">{persona.outcome}</p>
                  </div>
                </div>

                {/* Steps */}
                <div className="mt-5">
                  <p className="text-xs font-semibold text-muted-foreground">How it flows</p>
                  <ol className="mt-3 grid gap-2 sm:grid-cols-2">
                    {persona.steps.map((step, index) => (
                      <li
                        key={step}
                        className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3"
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-foreground font-mono text-[11px] font-semibold tabular-nums text-background">
                          {index + 1}
                        </span>
                        <span className="text-sm leading-5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Right: chart visual */}
              <div className="border-t border-border bg-surface-2 p-4 sm:p-5 xl:border-l xl:border-t-0">
                <PersonaVisual kind={persona.chart} />
              </div>
            </div>
          </div>

          {/* Data controls footer */}
          <div className="border-t border-border bg-surface-2 p-5 sm:p-6">
            <div className="mb-4">
              <h3 className="text-sm font-semibold">Data controls</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Practical safeguards for client work, pricing and roadmap data.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              {CONTROLS.map((control) => {
                const Icon = control.icon
                return (
                  <div
                    key={control.title}
                    className="flex flex-col rounded-xl border border-border bg-card p-4"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-2">
                      <Icon className="h-4 w-4 text-foreground" aria-hidden="true" />
                    </span>
                    <p className="mt-3 text-xs font-semibold leading-5">{control.title}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{control.body}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PersonaVisual({ kind }: { kind: Persona["chart"] }) {
  if (kind === "inflow") {
    return (
      <div className="flex h-full flex-col rounded-xl border border-border bg-card p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Quote to cash</p>
        <div className="mt-3 space-y-2">
          {[
            { label: "Quote sent", value: 100, color: "var(--chart-2)" },
            { label: "Accepted", value: 68, color: "var(--chart-3)" },
            { label: "Invoiced", value: 61, color: "var(--chart-1)" },
            { label: "Paid on time", value: 44, color: "var(--chart-5)" },
          ].map((row, index) => (
            <div key={row.label} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-[10px] text-muted-foreground">{row.label}</span>
              <div className="h-6 flex-1 overflow-hidden rounded-lg bg-muted">
                <div
                  className="flex h-full items-center justify-end rounded-lg px-2 text-[9px] font-medium text-background transition-[width] duration-700"
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
        <p className="mt-auto pt-3 text-[10px] leading-relaxed text-muted-foreground">
          Illustrative funnel based on cited late-payment rates.
        </p>
      </div>
    )
  }

  if (kind === "comparison") {
    return (
      <div className="grid h-full gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
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
        <div className="rounded-xl border border-border bg-card p-4">
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

  return (
    <div className="grid h-full gap-3">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-baseline justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Snippets reused
          </p>
          <p className="text-lg font-semibold tabular-nums tracking-tight">3.4x</p>
        </div>
        <Sparkline values={[4, 7, 6, 11, 9, 14, 18, 16, 23]} height={64} color="var(--chart-2)" />
        <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
          Illustrative reuse trend, not product telemetry.
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Where time goes
        </p>
        <ul className="space-y-2">
          {[
            { label: "Rewriting helpers", width: 86 },
            { label: "Finding saved code", width: 64 },
            { label: "Rebuilding context", width: 41 },
          ].map((row) => (
            <li key={row.label} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-[10px] text-muted-foreground sm:w-32">{row.label}</span>
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
