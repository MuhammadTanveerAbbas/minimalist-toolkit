"use client"

import { useMemo, useState } from "react"
import { ShieldAlert, ShieldCheck, TrendingDown, TrendingUp } from "lucide-react"
import { BarChart, CHART_COLORS, ComparisonBar } from "@/components/charts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FragilityResult } from "@/lib/prioritizer/analysis"
import type { PrioritizationItem } from "@/lib/prioritizer/types"

export interface FragilityReportProps {
  fragility: FragilityResult[]
  items: PrioritizationItem[]
  percent: number
  onPercentChange: (percent: number) => void
}

const PERCENT_OPTIONS = [10, 20, 30]

/**
 * Rank fragility.
 *
 * Answers the question that makes a score defensible: if the inputs are a
 * little wrong, does the order hold? Each item's inputs are moved up and down
 * by the selected percentage, one at a time, and the ranking is recomputed.
 */
export function FragilityReport({
  fragility,
  items,
  percent,
  onPercentChange,
}: FragilityReportProps) {
  const nameById = useMemo(
    () => new Map(items.map((item) => [item.id, item.name || "Untitled feature"])),
    [items]
  )

  const fragile = fragility.filter((entry) => entry.isFragile)
  const stable = fragility.filter((entry) => !entry.isFragile)

  const rangeData = useMemo(
    () =>
      fragile.map((entry) => ({
        label: nameById.get(entry.itemId) ?? entry.itemId,
        value: entry.worstRank - entry.bestRank,
        color: CHART_COLORS[fragile.indexOf(entry) % CHART_COLORS.length],
      })),
    [fragile, nameById]
  )

  if (fragility.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface-2 p-6 text-center">
        <p className="text-sm font-medium">Nothing to stress test yet</p>
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">
          Add features and give them scores. The fragility check then shows which positions in the
          ranking depend on a single assumption.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold">Assumption shift</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Each input is moved by this amount, one at a time, and the whole ranking is recomputed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Perturbation</span>
          <Select value={String(percent)} onValueChange={(v) => onPercentChange(Number(v))}>
            <SelectTrigger className="h-11 w-24 text-sm md:h-9" aria-label="Perturbation percentage">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERCENT_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  +/-{option}%
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-warning" aria-hidden="true" />
            <p className="text-sm font-semibold">Fragile positions</p>
          </div>
          <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">{fragile.length}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Move two or more places when a single input shifts by {percent} percent.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-success" aria-hidden="true" />
            <p className="text-sm font-semibold">Stable positions</p>
          </div>
          <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">{stable.length}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Hold their place under the same test.
          </p>
        </div>
      </div>

      {fragile.length > 0 ? (
        <section className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold">How far each fragile item can move</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Number of rank positions the item can travel under a {percent} percent shift.
          </p>
          <BarChart data={rangeData} className="mt-4" />
        </section>
      ) : null}

      <section className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold">What is driving each position</h3>
        {fragile.length === 0 ? (
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            No item changes rank by two places or more. This ordering holds up under a {percent} percent
            shift in any single input.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {fragile.map((entry) => {
              const name = nameById.get(entry.itemId) ?? entry.itemId
              return (
                <li key={entry.itemId} className="rounded-lg border border-border bg-surface-2 p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="min-w-0 break-words text-sm font-medium">{name}</p>
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" aria-hidden="true" />
                      #{entry.currentRank}
                      <TrendingDown className="h-3 w-3" aria-hidden="true" />
                      #{entry.worstRank}
                    </span>
                  </div>

                  <ComparisonBar
                    className="mt-3"
                    options={[
                      { label: "Best case rank", value: entry.bestRank, color: "var(--chart-5)" },
                      { label: "Current rank", value: entry.currentRank, color: "var(--chart-1)" },
                      { label: "Worst case rank", value: entry.worstRank, color: "var(--chart-3)" },
                    ]}
                    formatValue={(v) => `#${Math.round(v)}`}
                  />

                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    It would have to be true that{" "}
                    <span className="font-medium text-foreground">
                      {entry.drivers.length > 0 ? entry.drivers.join(", ") : "an unspecified input"}
                    </span>{" "}
                    {entry.drivers.length === 1 ? "is" : "are"} different from what you recorded.
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
