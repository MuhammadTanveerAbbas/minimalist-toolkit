"use client"

import Link from "next/link"
import { useMemo, useSyncExternalStore } from "react"
import { ArrowRight, Clock } from "lucide-react"
import { useSnippets } from "@/hooks/use-snippets"
import { getSnippetCounts } from "@/lib/snippet-stats"
import { LANGUAGE_NAMES } from "@/lib/editor-languages"
import { Skeleton } from "@/components/ui/skeleton"
import { TOOLS } from "@/lib/navigation"
import { getSupabaseConfig, SUPABASE_SETUP_MESSAGE } from "@/lib/supabase/config"
import type { Language } from "@/lib/types"

const CONTAINER = "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8"

function Stat({ label, value, meta }: { label: string; value: number; meta: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="font-mono text-[10px] font-semibold text-muted-foreground/60">{label}</p>
      <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight">{value}</p>
      <p className="mt-1.5 text-xs text-muted-foreground">{meta}</p>
    </div>
  )
}

function readLocalHistoryCount(key: string): number {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return 0
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.length : 0
  } catch {
    return 0
  }
}

/** A stable localStorage snapshot so server and client markup stay identical. */
function useLocalHistoryCount(key: string): number {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener("storage", onChange)
      window.addEventListener("toolkit-history-change", onChange)
      return () => {
        window.removeEventListener("storage", onChange)
        window.removeEventListener("toolkit-history-change", onChange)
      }
    },
    () => readLocalHistoryCount(key),
    () => 0
  )
}

/** One line chart. The only coloured element on the page is its latest trend. */
function ActivityChart({ activity }: { activity: { label: string; value: number }[] }) {
  const max = Math.max(1, ...activity.map((day) => day.value))
  const x = (index: number) => 12 + (index * 616) / (activity.length - 1)
  const y = (value: number) => 136 - (value / max) * 112
  const points = activity.map((day, index) => `${x(index)},${y(day.value)}`).join(" ")
  const last = activity[activity.length - 1]

  return (
    <div>
      <div className="mt-5 flex items-end justify-between gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Snippet activity</h2>
        <span className="text-[11px] text-muted-foreground">Last 7 days</span>
      </div>

      <svg
        viewBox="0 0 640 176"
        className="mt-4 h-44 w-full"
        role="img"
        aria-label={`Snippets updated over the last 7 days: ${activity
          .map((day) => `${day.label} ${day.value}`)
          .join(", ")}`}
      >
        {[24, 64, 104, 136].map((lineY) => (
          <line
            key={lineY}
            x1="12"
            x2="628"
            y1={lineY}
            y2={lineY}
            stroke="var(--chart-grid)"
            strokeWidth="1"
          />
        ))}
        <polyline
          points={points}
          fill="none"
          stroke="var(--brand)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {activity.map((day, index) => (
          <g key={`${day.label}-${index}`}>
            <circle cx={x(index)} cy={y(day.value)} r="3" fill="var(--brand)">
              <title>{`${day.value} updated on ${day.label}`}</title>
            </circle>
            <text
              x={x(index)}
              y="166"
              textAnchor="middle"
              className="fill-muted-foreground font-mono text-[10px]"
            >
              {day.label}
            </text>
          </g>
        ))}
        <text x={x(activity.length - 1)} y={Math.max(12, y(last.value) - 12)} textAnchor="end" className="font-mono text-[11px] font-medium" fill="var(--brand)">
          {last.value}
        </text>
      </svg>
    </div>
  )
}

function MakeupBar({ label, value, total }: { label: string; value: number; total: number }) {
  const percent = total === 0 ? 0 : Math.round((value / total) * 100)
  return (
    <li className="flex items-center gap-3 py-1.5">
      <span className="w-20 shrink-0 truncate text-xs text-muted-foreground">{label}</span>
      <span className="h-1.5 min-w-0 flex-1 rounded-full bg-muted">
        <span className="block h-full rounded-full bg-foreground/25" style={{ width: `${percent}%` }} />
      </span>
      <span className="w-6 shrink-0 text-right font-mono text-[11px] tabular-nums">{value}</span>
    </li>
  )
}

export function Dashboard() {
  const { allSnippets, allCategories, allTags, isLoaded } = useSnippets()
  const mockifyCount = useLocalHistoryCount("mockify_history")
  const promptcraftCount = useLocalHistoryCount("promptcraft_history")
  const configReady = useMemo(() => getSupabaseConfig() !== null, [])

  const counts = useMemo(() => getSnippetCounts(allSnippets), [allSnippets])

  const topLanguages = useMemo(
    () =>
      Object.entries(counts.byLanguage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
    [counts.byLanguage]
  )

  const activity = useMemo(() => {
    const days: { label: string; value: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const day = new Date()
      day.setDate(day.getDate() - i)
      const key = day.toISOString().slice(0, 10)
      days.push({
        label: day.toLocaleDateString(undefined, { weekday: "short" }),
        value: allSnippets.filter((snippet) => snippet.updatedAt.slice(0, 10) === key).length,
      })
    }
    return days
  }, [allSnippets])

  const activityTotal = activity.reduce((sum, day) => sum + day.value, 0)
  const hasRecentActivity = activity.some((day) => day.value > 0)

  const recent = useMemo(
    () =>
      [...allSnippets]
        .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
        .slice(0, 6),
    [allSnippets]
  )

  return (
    <div className={CONTAINER}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-3xl tracking-tight sm:text-4xl">Analytics</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Your workspace at a glance. Every figure comes from data stored in your account.
          </p>
        </div>
        <Link
          href="/app/snippets"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Open Snippets
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      {!configReady ? (
        <div role="status" className="mt-6 rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium">Workspace data is unavailable</p>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{SUPABASE_SETUP_MESSAGE}</p>
        </div>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {isLoaded ? (
          <>
            <Stat label="Snippets" value={counts.total} meta={`${activityTotal} updated this week`} />
            <Stat label="Categories" value={allCategories.length} meta="in your library" />
            <Stat label="Tags" value={allTags.length} meta="distinct labels" />
            <Stat
              label="Generations"
              value={mockifyCount + promptcraftCount}
              meta="saved in this browser"
            />
          </>
        ) : (
          <>
            <Skeleton className="h-[112px] rounded-xl" />
            <Skeleton className="h-[112px] rounded-xl" />
            <Skeleton className="h-[112px] rounded-xl" />
            <Skeleton className="h-[112px] rounded-xl" />
          </>
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-card p-5 lg:col-span-2 sm:p-6">
          {!isLoaded ? (
            <>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-6 h-44 w-full" />
            </>
          ) : counts.total === 0 || !hasRecentActivity ? (
            <EmptyPanel
              title="No activity yet"
              body="Create a snippet and this chart tracks what you touch and when."
              href="/app/snippets"
              cta="Open Snippets"
            />
          ) : (
            <ActivityChart activity={activity} />
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-muted-foreground">Library makeup</h2>
          {!isLoaded ? (
            <div className="mt-5 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ) : counts.total === 0 ? (
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Save a snippet to see how your library is shared and which languages you use.
            </p>
          ) : (
            <>
              <p className="mt-5 text-[10px] font-semibold text-muted-foreground/60">Visibility</p>
              <ul className="mt-2">
                <MakeupBar label="Public" value={counts.public} total={counts.total} />
                <MakeupBar label="Private" value={counts.private} total={counts.total} />
              </ul>
              <p className="mt-5 text-[10px] font-semibold text-muted-foreground/60">Top languages</p>
              {topLanguages.length === 0 ? (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">No language data yet.</p>
              ) : (
                <ul className="mt-2">
                  {topLanguages.map(([lang, value]) => (
                    <MakeupBar
                      key={lang}
                      label={LANGUAGE_NAMES[lang as Language] ?? lang}
                      value={value}
                      total={counts.total}
                    />
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      </div>

      <section className="mt-4 rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Recently updated</h2>
          <Link
            href="/app/categories"
            className="inline-flex min-h-9 items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Categories
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {!isLoaded ? (
          <Skeleton className="mt-4 h-28" />
        ) : recent.length === 0 ? (
          <EmptyPanel
            title="No snippets yet"
            body="Save your first snippet to see your most recent work here."
            href="/app/snippets"
            cta="Create a snippet"
          />
        ) : (
          <ul className="mt-4 divide-y divide-border border-t border-border">
            {recent.map((snippet) => (
              <li key={snippet.id}>
                <Link
                  href="/app/snippets"
                  className="flex items-center justify-between gap-3 py-3 transition-colors hover:text-foreground"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{snippet.title}</p>
                    <p className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {new Date(snippet.updatedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                    {LANGUAGE_NAMES[snippet.language as Language] ?? snippet.language}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-4 rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-muted-foreground">Jump to a tool</h2>
        <ul className="mt-3 divide-y divide-border border-t border-border">
          {TOOLS.map((tool) => {
            const Icon = tool.icon
            return (
              <li key={tool.id}>
                <Link
                  href={tool.href}
                  className="group flex items-center gap-3 py-3 transition-colors hover:text-foreground"
                >
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{tool.name}</span>
                    <span className="block text-xs text-muted-foreground">{tool.tagline}</span>
                  </span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

function EmptyPanel({
  title,
  body,
  href,
  cta,
}: {
  title: string
  body: string
  href: string
  cta: string
}) {
  return (
    <div className="mt-3 rounded-lg border border-dashed border-border bg-surface-2 p-5">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{body}</p>
      <Link
        href={href}
        className="mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-foreground px-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        {cta}
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </div>
  )
}
