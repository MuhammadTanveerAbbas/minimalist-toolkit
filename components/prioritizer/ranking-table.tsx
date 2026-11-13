"use client"

import { useMemo, useState } from "react"
import { ArrowDown, ArrowUp, FileText, Pencil, ShieldAlert } from "lucide-react"
import { CHART_COLORS } from "@/components/charts"
import { cn } from "@/lib/utils"
import type { RankedItem } from "@/lib/prioritizer/scoring"
import type { FragilityResult } from "@/lib/prioritizer/analysis"
import type { PrioritizationItem, PrioritizationProject } from "@/lib/prioritizer/types"
import { fieldsForProject } from "./score-inputs"

type SortKey = "rank" | "name" | "score"

export interface RankingTableProps {
  ranked: RankedItem[]
  project: PrioritizationProject
  fragility: FragilityResult[]
  onEdit: (item: PrioritizationItem) => void
}

const EVIDENCE_KEYS = ["reach", "impact", "confidence", "effort"] as const

/**
 * The ranked list.
 *
 * On a wide screen this is a table. On a narrow screen each row becomes a
 * card, because a horizontally scrolling table is unusable on a phone.
 */
export function RankingTable({ ranked, project, fragility, onEdit }: RankingTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("rank")
  const [ascending, setAscending] = useState(true)

  const fragilityById = useMemo(
    () => new Map(fragility.map((entry) => [entry.itemId, entry])),
    [fragility]
  )

  const sorted = useMemo(() => {
    const list = [...ranked]
    const direction = ascending ? 1 : -1
    switch (sortKey) {
      case "name":
        return list.sort(
          (a, b) => direction * a.item.name.trim().localeCompare(b.item.name.trim())
        )
      case "score":
        return list.sort((a, b) => direction * (a.score - b.score))
      default:
        return list.sort((a, b) => direction * (a.rank - b.rank))
    }
  }, [ascending, ranked, sortKey])

  const specs = fieldsForProject(project)
  const maxScore = Math.max(1, ...ranked.map((entry) => entry.score))

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setAscending((v) => !v)
      return
    }
    setSortKey(key)
    setAscending(key === "score" ? false : true)
  }

  function sortIcon(key: SortKey) {
    if (sortKey !== key) return null
    return ascending ? (
      <ArrowUp className="h-3 w-3" aria-hidden="true" />
    ) : (
      <ArrowDown className="h-3 w-3" aria-hidden="true" />
    )
  }

  if (ranked.length === 0) {
    return null
  }

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-border bg-card lg:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Ranked features with their scores and evidence</caption>
          <thead className="border-b border-border bg-surface-2">
            <tr>
              <th scope="col" className="w-16 px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleSort("rank")}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                >
                  Rank {sortIcon("rank")}
                </button>
              </th>
              <th scope="col" className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleSort("name")}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                >
                  Feature {sortIcon("name")}
                </button>
              </th>
              <th scope="col" className="px-4 py-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Inputs
                </span>
              </th>
              <th scope="col" className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => toggleSort("score")}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                >
                  Score {sortIcon("score")}
                </button>
              </th>
              <th scope="col" className="px-4 py-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Evidence
                </span>
              </th>
              <th scope="col" className="w-20 px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map((entry, index) => {
              const item = entry.item
              const result = fragilityById.get(item.id)
              const evidenceCount = EVIDENCE_KEYS.filter(
                (key) => item.evidence[key]?.trim()
              ).length
              const isTop = entry.rank === 1
              return (
                <tr
                  key={item.id}
                  className={cn(
                    "transition-colors hover:bg-accent/40",
                    isTop && "bg-brand/[0.04]"
                  )}
                >
                  <td className="px-4 py-3 align-top">
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-semibold tabular-nums",
                        isTop ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {entry.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <p className="font-medium">{item.name || "Untitled feature"}</p>
                    {item.description ? (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}
                    {result?.isFragile ? (
                      <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-warning/15 px-1.5 py-0.5 text-[10px] font-medium text-warning">
                        <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                        Fragile
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <ul className="flex flex-wrap gap-1">
                      {specs.slice(0, 4).map((spec) => (
                        <li
                          key={spec.field}
                          className="rounded bg-muted px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground"
                        >
                          {spec.label.slice(0, 4)} {item[spec.field] as unknown as number}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center gap-2">
                      <span className="w-14 shrink-0 text-sm font-semibold tabular-nums">
                        {entry.score}
                      </span>
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-[width] duration-500"
                          style={{
                            width: `${Math.max(2, (entry.score / maxScore) * 100)}%`,
                            backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                    {entry.tied ? (
                      <p className="mt-1 text-[10px] text-muted-foreground">Tied score</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" aria-hidden="true" />
                      {evidenceCount} of {EVIDENCE_KEYS.length}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      aria-label={`Edit ${item.name || "feature"}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="flex flex-col gap-3 lg:hidden">
        {sorted.map((entry, index) => {
          const item = entry.item
          const result = fragilityById.get(item.id)
          const evidenceCount = EVIDENCE_KEYS.filter((key) => item.evidence[key]?.trim()).length
          const isTop = entry.rank === 1
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onEdit(item)}
                className={cn(
                  "w-full rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-foreground/25",
                  isTop && "border-brand/40"
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold tabular-nums",
                      isTop ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {entry.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-medium">{item.name || "Untitled feature"}</p>
                    {item.description ? (
                      <p className="mt-0.5 line-clamp-2 break-words text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">{entry.score}</span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {specs.slice(0, 4).map((spec) => (
                    <span
                      key={spec.field}
                      className="rounded bg-muted px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground"
                    >
                      {spec.label.slice(0, 4)} {item[spec.field] as unknown as number}
                    </span>
                  ))}
                  <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    <FileText className="h-2.5 w-2.5" aria-hidden="true" />
                    {evidenceCount}/{EVIDENCE_KEYS.length}
                  </span>
                  {result?.isFragile ? (
                    <span className="inline-flex items-center gap-1 rounded bg-warning/15 px-1.5 py-0.5 text-[10px] font-medium text-warning">
                      <ShieldAlert className="h-2.5 w-2.5" aria-hidden="true" />
                      Fragile
                    </span>
                  ) : null}
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
