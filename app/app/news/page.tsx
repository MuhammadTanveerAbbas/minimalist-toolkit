import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { NewsFeed } from "@/components/news/news-feed"

export const metadata: Metadata = {
  title: "AI News",
}

export const dynamic = "force-dynamic"

interface NewsRow {
  id: string
  source: string
  title: string
  url: string
  summary: string
  author: string | null
  published_at: string
  score: number | null
  tags: string[] | null
}

export default async function NewsPage() {
  const supabase = await createClient()

  let rows: NewsRow[] = []
  let setupNote: string | null = null

  try {
    const { data, error } = await supabase
      .from("news_items")
      .select("id,source,title,url,summary,author,published_at,score,tags")
      .order("published_at", { ascending: false })
      .limit(300)

    if (error) {
      setupNote = "The news table is not available yet. Apply supabase/schema.sql and run the cron job."
    } else {
      rows = (data ?? []) as NewsRow[]
    }
  } catch {
    setupNote = "Supabase is not configured. Set the environment variables in .env.local."
  }

  const items = rows.map((row) => ({
    id: row.id,
    source: row.source,
    title: row.title,
    url: row.url,
    summary: row.summary,
    author: row.author,
    publishedAt: row.published_at,
    score: row.score,
    tags: Array.isArray(row.tags) ? row.tags : [],
  }))

  const lastUpdated = items.length ? items[0].publishedAt : null

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl tracking-tight">AI News</h1>
        <p className="text-sm text-muted-foreground">
          New AI stories, papers, repositories and models. Refreshed once a day.
        </p>
      </div>
      <NewsFeed items={items} lastUpdated={lastUpdated} setupNote={setupNote} />
    </div>
  )
}
