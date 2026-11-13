"use client"

import Link from "next/link"
import { useEffect, useMemo, useSyncExternalStore } from "react"
import {
  ArrowRight,
  Clock,
  Code2,
  FolderOpen,
  ImageIcon,
  Tag,
  TrendingUp,
  User,
} from "lucide-react"
import { useSnippets } from "@/hooks/use-snippets"
import { useUserProfile } from "@/hooks/use-user-profile"
import { getSnippetCounts } from "@/lib/snippet-stats"
import { LANGUAGE_NAMES } from "@/lib/editor-languages"
import { BarChart, CHART_COLORS, DonutChart } from "@/components/charts"
import { Skeleton } from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/workspace/user-avatar"
import { TOOLS } from "@/lib/navigation"
import type { Language } from "@/lib/types"

const CONTAINER = "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"

function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string
  value: React.ReactNode
  icon: React.ElementType
  hint?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2.5 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p> : null}
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

/**
 * Reads a count out of localStorage as an external store so the server and
 * client markup stay identical without a cascading render.
 */
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

export function Dashboard() {
  const { allSnippets, allCategories, allTags, isLoaded } = useSnippets()
  const mockifyCount = useLocalHistoryCount("mockify_history")
  const promptcraftCount = useLocalHistoryCount("promptcraft_history")
  const { name, email, avatarUrl, initials } = useUserProfile()

  const counts = useMemo(() => getSnippetCounts(allSnippets), [allSnippets])

  const topLanguages = useMemo(
    () =>
      Object.entries(counts.byLanguage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([lang, count], i) => ({
          label: LANGUAGE_NAMES[lang as Language] ?? lang,
          value: count,
          color: CHART_COLORS[i % CHART_COLORS.length],
        })),
    [counts.byLanguage]
  )

  const visibility = useMemo(
    () => [
      { label: "Public", value: counts.public, color: CHART_COLORS[4] },
      { label: "Private", value: counts.private, color: CHART_COLORS[1] },
    ],
    [counts.private, counts.public]
  )

  const recent = useMemo(
    () =>
      [...allSnippets]
        .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
        .slice(0, 6),
    [allSnippets]
  )

  const activity = useMemo(() => {
    const days: { label: string; value: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const day = new Date()
      day.setDate(day.getDate() - i)
      const key = day.toISOString().slice(0, 10)
      const value = allSnippets.filter((s) => s.updatedAt.slice(0, 10) === key).length
      days.push({
        label: day.toLocaleDateString(undefined, { weekday: "short" }),
        value,
      })
    }
    return days
  }, [allSnippets])

  const maxActivity = Math.max(1, ...activity.map((a) => a.value))

  return (
    <div className={CONTAINER}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <UserAvatar
            src={avatarUrl}
            name={name ?? "Signed in"}
            initials={initials}
            size={48}
            className="hidden rounded-2xl sm:flex"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-muted-foreground">
              {name ? `Welcome back, ${name.split(" ")[0]}` : "Welcome back"}
            </p>
            <h1 className="mt-0.5 text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
              Your workspace at a glance. Every number below comes from the data stored in your account.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {TOOLS.slice(0, 3).map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium transition-colors hover:bg-accent"
            >
              <tool.icon className="h-4 w-4" style={{ color: tool.accent }} aria-hidden="true" />
              {tool.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Account */}
      <section className="mt-6 flex flex-col items-start gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:p-5">
        <UserAvatar
          src={avatarUrl}
          name={name ?? "Signed in"}
          initials={initials}
          size={56}
          className="rounded-2xl"
        />
        <div className="min-w-0 flex-1">
          <h2 className="break-words text-base font-semibold tracking-tight">
            {name ?? "Your Google account"}
          </h2>
          <p className="mt-0.5 break-all text-sm text-muted-foreground">
            {email ?? "Signed in with Google"}
          </p>
        </div>
        <Link
          href="/app/profile"
          className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-medium transition-colors hover:bg-accent"
        >
          <User className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Manage profile</span>
          <span className="sm:hidden">Profile</span>
        </Link>
      </section>

      {/* Stats */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {isLoaded ? (
          <>
            <StatCard label="Snippets" value={counts.total} icon={Code2} hint="Saved in your library" />
            <StatCard label="Categories" value={allCategories.length} icon={FolderOpen} hint="Across all snippets" />
            <StatCard label="Tags" value={allTags.length} icon={Tag} hint="Distinct labels in use" />
            <StatCard
              label="Generations"
              value={mockifyCount + promptcraftCount}
              icon={ImageIcon}
              hint="Mockify and PromptCraft, this browser"
            />
          </>
        ) : (
          <>
            <Skeleton className="h-[104px]" />
            <Skeleton className="h-[104px]" />
            <Skeleton className="h-[104px]" />
            <Skeleton className="h-[104px]" />
          </>
        )}
      </div>

      {/* Analytics row */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Snippet activity</h2>
            <span className="text-xs text-muted-foreground">Last 7 days</span>
          </div>

          {!isLoaded ? (
            <Skeleton className="mt-4 h-40" />
          ) : counts.total === 0 ? (
            <EmptyPanel
              title="No activity yet"
              body="Create a snippet and this chart starts tracking what you touch and when."
              href="/app/snippets"
              cta="Open Snippets"
            />
          ) : (
            <>
              <div className="mt-5 flex items-end gap-1.5" role="img" aria-label="Snippets updated per day over the last 7 days">
                {activity.map((day) => (
                  <div key={day.label} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-28 w-full items-end">
                      <div
                        className="w-full rounded-t bg-chart-2 transition-[height] duration-500"
                        style={{ height: `${Math.max(3, (day.value / maxActivity) * 100)}%` }}
                        title={`${day.value} updated`}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{day.label}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
                {counts.total} snippet{counts.total === 1 ? "" : "s"} updated across{" "}
                {allCategories.length || "no"} categor{allCategories.length === 1 ? "y" : "ies"}.
              </p>
            </>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Visibility split</h2>
          {!isLoaded ? (
            <Skeleton className="mt-4 h-32" />
          ) : counts.total === 0 ? (
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Save a snippet and this will show how much of your library is shared versus private.
            </p>
          ) : (
            <div className="mt-4 flex items-center gap-4">
              <DonutChart
                size={104}
                thickness={14}
                data={visibility}
                centerValue={counts.total}
                centerLabel="snippets"
              />
              <ul className="min-w-0 flex-1 space-y-2">
                {visibility.map((item) => (
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
          )}

          <h3 className="mt-6 text-sm font-semibold">Top languages</h3>
          {!isLoaded ? (
            <Skeleton className="mt-3 h-24" />
          ) : topLanguages.length === 0 ? (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">No language data yet.</p>
          ) : (
            <BarChart data={topLanguages} className="mt-3" showValues={false} />
          )}
        </section>
      </div>

      {/* Recent */}
      <section className="mt-4 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Recently updated</h2>
          <Link
            href="/app/snippets"
            className="inline-flex min-h-9 items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            All snippets
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {!isLoaded ? (
          <Skeleton className="mt-4 h-32" />
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
                  className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-accent/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{snippet.title}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {new Date(snippet.updatedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-md border border-border bg-surface-2 px-2 py-1 text-[11px] text-muted-foreground">
                    {LANGUAGE_NAMES[snippet.language as Language] ?? snippet.language}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Tools */}
      <section className="mt-4 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Jump to a tool</h2>
          <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {TOOLS.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="group flex flex-col rounded-lg border border-border bg-surface-2 p-4 transition-colors hover:border-foreground/25 hover:bg-card"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card"
                  style={{ color: tool.accent }}
                >
                  <tool.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <ArrowRight
                  className="h-4 w-4 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </div>
              <h3 className="mt-3 text-sm font-semibold">{tool.name}</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{tool.tagline}</p>
            </Link>
          ))}
        </div>
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
    <div className="mt-4 rounded-lg border border-dashed border-border bg-surface-2 p-5">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{body}</p>
      <Link
        href={href}
        className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-foreground px-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        {cta}
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </div>
  )
}
