"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowRight, Code2, FolderOpen, LayoutGrid, Search } from "lucide-react"
import { useSnippets } from "@/hooks/use-snippets"
import { getSnippetCounts } from "@/lib/snippet-stats"
import { BarChart, CHART_COLORS, DonutChart } from "@/components/charts"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const CONTAINER = "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"

export default function CategoriesPage() {
  const { allSnippets, allCategories, isLoaded } = useSnippets()
  const [query, setQuery] = useState("")

  const counts = useMemo(() => getSnippetCounts(allSnippets), [allSnippets])

  const rows = useMemo(
    () =>
      allCategories
        .map((c) => ({ name: c, count: counts.byCategory[c] ?? 0 }))
        .sort((a, b) => b.count - a.count),
    [allCategories, counts.byCategory]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) => row.name.toLowerCase().includes(q))
  }, [query, rows])

  const chartData = useMemo(
    () =>
      rows
        .slice(0, 6)
        .map((row, i) => ({ label: row.name, value: row.count, color: CHART_COLORS[i % CHART_COLORS.length] })),
    [rows]
  )

  return (
    <div className={CONTAINER}>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Categories</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        How your snippet library is organised. Open Snippet Manager to create, edit, or filter by category.
      </p>

      {!isLoaded ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface-2">
            <FolderOpen className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-base font-semibold">No categories yet</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            Add a category when you create or edit a snippet in Snippet Manager. Categories are what make a
            large library navigable.
          </p>
          <Link
            href="/app/snippets"
            className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            <Code2 className="h-4 w-4" aria-hidden="true" />
            Open Snippets
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {/* Distribution chart */}
            <section className="rounded-xl border border-border bg-card p-5 lg:col-span-1">
              <h2 className="text-sm font-semibold">Distribution</h2>
              <div className="mt-4 flex items-center gap-4">
                <DonutChart
                  size={104}
                  thickness={14}
                  data={chartData}
                  centerValue={counts.total}
                  centerLabel="snippets"
                />
                <ul className="min-w-0 flex-1 space-y-1.5">
                  {chartData.slice(0, 4).map((item) => (
                    <li key={item.label} className="flex items-center gap-2 text-xs">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                        aria-hidden="true"
                      />
                      <span className="truncate text-muted-foreground">{item.label}</span>
                      <span className="ml-auto shrink-0 font-medium tabular-nums">{item.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Ranked chart */}
            <section className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">Snippets per category</h2>
                <span className="text-xs text-muted-foreground">{rows.length} categories</span>
              </div>
              <BarChart data={chartData} className="mt-4" />
            </section>
          </div>

          {/* Search */}
          <div className="relative mt-6">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter categories..."
              aria-label="Filter categories"
              className="h-11 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm transition-colors placeholder:text-muted-foreground outline-none sm:max-w-sm"
            />
          </div>

          {filtered.length === 0 ? (
            <p className="mt-6 rounded-lg border border-dashed border-border bg-surface-2 px-4 py-8 text-center text-sm text-muted-foreground">
              No category matches &ldquo;{query}&rdquo;.
            </p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((row) => {
                const share = counts.total > 0 ? Math.round((row.count / counts.total) * 100) : 0
                return (
                  <Link
                    key={row.name}
                    href="/app/snippets"
                    className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/25 hover:bg-accent/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2">
                          <FolderOpen className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        </span>
                        <span className="truncate font-medium">{row.name}</span>
                      </div>
                      <ArrowRight
                        className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-sm text-muted-foreground">
                        {row.count} snippet{row.count === 1 ? "" : "s"}
                      </p>
                      <p className="text-xs tabular-nums text-muted-foreground">{share}%</p>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-chart-1 transition-[width] duration-700"
                        style={{ width: `${Math.max(row.count > 0 ? 3 : 0, share)}%` }}
                      />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-border bg-surface-2 p-4">
            <LayoutGrid className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              Category filtering is managed in{" "}
              <Link href="/app/snippets" className="font-medium text-foreground underline-offset-4 hover:underline">
                Snippet Manager
              </Link>
              , where you can also combine categories with language and tag filters.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
