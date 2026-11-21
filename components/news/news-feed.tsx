"use client"

import { useState } from "react"
import { ExternalLink } from "lucide-react"
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

function metaLine(item: NewsItem): string {
  const parts: string[] = []
  if (item.source === "github" && item.score != null) parts.push(`${item.score.toLocaleString()} stars`)
  else if (item.source === "huggingface" && item.score != null) parts.push(`${item.score.toLocaleString()} downloads`)
  else if (item.score != null) parts.push(`${item.score} points`)
  if (item.author) parts.push(`by ${item.author}`)
  return parts.join(" · ")
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
            <code className="rounded bg-surface-2 px-1 py-0.5 font-mono text-[11px]">
              curl -H &quot;Authorization: Bearer $CRON_SECRET&quot; https://your-domain.com/api/cron/news
            </code>
          </p>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="mt-6">
      {lastUpdated ? (
        <p className="mb-4 text-xs text-muted-foreground">
          Last updated {relativeTime(lastUpdated)}.
        </p>
      ) : null}

      <Tabs value={source} onValueChange={setSource}>
        <TabsList className="flex h-auto flex-wrap">
          {SOURCE_ORDER.map((key) => (
            <TabsTrigger key={key} value={key} className="gap-1.5">
              {SOURCE_LABELS[key]}
              <span className="text-xs tabular-nums text-muted-foreground">{counts[key] ?? 0}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {SOURCE_ORDER.map((key) => (
          <TabsContent key={key} value={key} className="mt-4">
            {visible.length === 0 ? (
              <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No items for this source yet.
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {groupEntries.map(([key, group]) => (
                  <section key={key}>
                    <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {dayLabel(key)}
                    </h2>
                    <ul className="flex flex-col gap-3">
                      {group.map((item) => (
                        <li key={item.id}>
                          <article className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/20">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary" className="text-[10px] font-medium">
                                  {SOURCE_LABELS[item.source] ?? item.source}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{relativeTime(item.publishedAt)}</span>
                              </div>
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer noopener"
                                title={`Opens ${item.url} in a new tab`}
                                className="inline-flex items-start gap-1.5 text-sm font-medium leading-5 hover:underline"
                              >
                                {item.title}
                                <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                              </a>
                              {item.summary ? (
                                <p className="line-clamp-3 text-xs leading-5 text-muted-foreground">{item.summary}</p>
                              ) : null}
                              {metaLine(item) ? (
                                <p className="text-xs text-muted-foreground">{metaLine(item)}</p>
                              ) : null}
                              {item.tags.length ? (
                                <ul className="flex flex-wrap gap-1.5">
                                  {item.tags.slice(0, 3).map((tag) => (
                                    <li
                                      key={tag}
                                      className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                                    >
                                      {tag}
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>
                          </article>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {items.length === 0 && !setupNote ? (
        <div className="mt-6 rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No news yet. Run the daily cron job to fill this page.
          <div className="mt-3">
            <code className="rounded bg-surface-2 px-2 py-1 font-mono text-[11px]">
              curl -H &quot;Authorization: Bearer $CRON_SECRET&quot; https://your-domain.com/api/cron/news
            </code>
          </div>
        </div>
      ) : null}
    </div>
  )
}
