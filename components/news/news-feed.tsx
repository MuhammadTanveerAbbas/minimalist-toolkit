"use client"

import { useState } from "react"
import { ExternalLink } from "lucide-react"
import { siArxiv, siGithub, siHuggingface, siYcombinator, type SimpleIcon } from "simple-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface NewsItem {
  id: string
  source: string
  title: string
  url: string
  summary: string
  author: string | null
  publishedAt: string
  score: number | null
  tags: string[]
}

interface NewsFeedProps {
  items: NewsItem[]
  lastUpdated: string | null
  setupNote: string | null
}

const SOURCE_ORDER = ["all", "hacker-news", "arxiv", "github", "huggingface"] as const
const SOURCE_LABELS: Record<string, string> = {
  all: "All",
  "hacker-news": "Hacker News",
  arxiv: "arXiv",
  github: "GitHub",
  huggingface: "Hugging Face",
}
const SOURCE_ICONS: Record<string, SimpleIcon | undefined> = {
  "hacker-news": siYcombinator,
  arxiv: siArxiv,
  github: siGithub,
  huggingface: siHuggingface,
}

function SourceIcon({ source, className }: { source: string; className?: string }) {
  if (source === "all") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <rect x="3" y="3" width="8" height="8" rx="2" />
        <rect x="13" y="3" width="8" height="8" rx="2" />
        <rect x="3" y="13" width="8" height="8" rx="2" />
        <rect x="13" y="13" width="8" height="8" rx="2" />
      </svg>
    )
  }
  const icon = SOURCE_ICONS[source]
  if (!icon) return null
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d={icon.path} />
    </svg>
  )
}

function dayKey(iso: string): string {
  const date = new Date(iso)
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function dayLabel(key: string): string {
  const [year, month, day] = key.split("-").map(Number)
  const date = new Date(year, month, day)
  const today = new Date()
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
  if (key === todayKey) return "Today"
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const yesterdayKey = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`
  if (key === yesterdayKey) return "Yesterday"
  return date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

/** Only show a detail when it carries real information. Never show zero counts. */
function detailLine(item: NewsItem): string | null {
  if (item.source === "hacker-news" && item.score != null && item.score > 0) {
    return `${item.score.toLocaleString()} points`
  }
  if (item.source === "github" && item.score != null && item.score > 0) {
    return `${item.score.toLocaleString()} stars`
  }
  if (item.source === "arxiv" && item.tags.length > 0) {
    return item.tags[0]
  }
  return null
}

export function NewsFeed({ items, lastUpdated, setupNote }: NewsFeedProps) {
  const [source, setSource] = useState<string>("all")

  const counts: Record<string, number> = { all: items.length }
  for (const key of SOURCE_ORDER) {
    if (key === "all") continue
    counts[key] = items.filter((item) => item.source === key).length
  }

  const visible = source === "all" ? items : items.filter((item) => item.source === source)

  const groups = new Map<string, NewsItem[]>()
  for (const item of visible) {
    const key = dayKey(item.publishedAt)
    const list = groups.get(key) ?? []
    list.push(item)
    groups.set(key, list)
  }
  const groupEntries = Array.from(groups.entries())

  if (setupNote && items.length === 0) {
    return (
      <Alert className="mt-6">
        <AlertDescription>
          <p>{setupNote}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Fill the feed manually with:{" "}
            <code className="break-all rounded bg-surface-2 px-1 py-0.5 font-mono text-[11px]">
              curl -H &quot;Authorization: Bearer $CRON_SECRET&quot; https://your-domain.com/api/cron/news
            </code>
          </p>
        </AlertDescription>
      </Alert>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mt-6 rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        No news yet. Run the daily cron job to fill this page.
        <div className="mt-3 overflow-x-auto">
          <code className="block break-all rounded bg-surface-2 px-2 py-1 font-mono text-[11px]">
            curl -H &quot;Authorization: Bearer $CRON_SECRET&quot; https://your-domain.com/api/cron/news
          </code>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6">
      {lastUpdated ? (
        <p className="mb-4 text-xs text-muted-foreground">
          Last updated <span suppressHydrationWarning>{relativeTime(lastUpdated)}</span>.
        </p>
      ) : null}

      <Tabs value={source} onValueChange={setSource}>
        <TabsList className="grid h-auto w-full grid-cols-5 gap-1 rounded-xl border border-border bg-surface-2 p-1 sm:flex sm:h-10 sm:w-fit sm:justify-start">
          {SOURCE_ORDER.map((key) => (
            <TabsTrigger
              key={key}
              value={key}
              aria-label={SOURCE_LABELS[key]}
              className="group flex h-10 flex-row items-center justify-center gap-1 rounded-lg border border-transparent px-0.5 text-xs font-medium transition-colors hover:bg-accent data-[state=active]:border-foreground data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-none sm:h-full sm:gap-2 sm:px-3"
            >
              <SourceIcon source={key} className="h-4 w-4 shrink-0 sm:h-3.5 sm:w-3.5" />
              <span className="hidden whitespace-nowrap sm:inline">{SOURCE_LABELS[key]}</span>
              <span className="min-w-5 rounded-md bg-muted px-0.5 py-0.5 text-center font-mono text-[10px] tabular-nums text-muted-foreground group-data-[state=active]:bg-background/15 group-data-[state=active]:text-background sm:min-w-6 sm:px-1 sm:py-0.5 sm:text-[11px]">
                {counts[key] ?? 0}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {SOURCE_ORDER.map((key) => (
          <TabsContent key={key} value={key} className="mt-6">
            {visible.length === 0 ? (
              <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No items for this source yet.
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {groupEntries.map(([key, group]) => (
                  <section key={key}>
                    <h2 className="mb-3 font-mono text-xs text-muted-foreground">{dayLabel(key)}</h2>
                    <ul className="grid grid-cols-2 gap-2 sm:gap-3">
                      {group.map((item) => {
                        const detail = detailLine(item)
                        return (
                          <li key={item.id}>
                            <article className="flex h-full min-w-0 flex-col rounded-xl border border-border bg-card p-3 transition-colors hover:border-foreground/25 sm:p-4">
                              <div className="flex items-center justify-between gap-1">
                                <Badge variant="secondary" className="gap-1.5 text-[10px] font-medium">
                                  <SourceIcon source={item.source} className="h-3 w-3" />
                                  <span className="hidden sm:inline">{SOURCE_LABELS[item.source] ?? item.source}</span>
                                </Badge>
                                <span
                                  suppressHydrationWarning
                                  className="hidden shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground sm:inline"
                                >
                                  {relativeTime(item.publishedAt)}
                                </span>
                              </div>

                              <h3 className="mt-3 line-clamp-3 break-words text-xs font-medium leading-snug sm:mt-4 sm:min-h-10 sm:text-sm">
                                {item.title}
                              </h3>

                              {detail ? (
                                <p className="mt-2 truncate font-mono text-[10px] tabular-nums text-muted-foreground sm:text-[11px]">
                                  {detail}
                                </p>
                              ) : null}

                              <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="mt-auto inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-border bg-card text-[11px] font-medium transition-colors hover:bg-accent sm:h-10 sm:gap-2 sm:text-sm"
                              >
                                <span className="sm:hidden">View source</span>
                                <span className="hidden sm:inline">View Original Source</span>
                                <ExternalLink className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" aria-hidden="true" />
                              </a>
                            </article>
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
