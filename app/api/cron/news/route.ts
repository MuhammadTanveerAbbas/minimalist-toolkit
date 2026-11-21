import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { fetchAllNews, type NewsSourceResult } from "@/lib/news/sources"

export const maxDuration = 60
export const dynamic = "force-dynamic"

function unauthorized() {
  return Response.json(
    { error: "Unauthorized. The Bearer token does not match CRON_SECRET." },
    { status: 401 }
  )
}

function misconfigured(message: string) {
  return Response.json({ error: message }, { status: 503 })
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim()
  if (!secret) {
    return misconfigured("CRON_SECRET is not set.")
  }

  const authHeader = req.headers.get("authorization") ?? ""
  const expected = `Bearer ${secret}`
  if (authHeader !== expected) {
    return unauthorized()
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !serviceKey) {
    return misconfigured("Supabase is not configured for the news cron job.")
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const sources: NewsSourceResult[] = await fetchAllNews()
  const allFailed = sources.every((source) => source.error !== null && source.items.length === 0)
  if (allFailed) {
    return Response.json(
      { ok: false, saved: 0, sources: sources.map((source) => ({ source: source.source, count: 0, error: source.error })) },
      { status: 502 }
    )
  }

  const rows = sources.flatMap((source) =>
    source.items.map((item) => ({
      id: item.id,
      source: item.source,
      title: item.title,
      url: item.url,
      summary: item.summary,
      author: item.author,
      published_at: item.publishedAt,
      score: item.score,
      tags: item.tags,
    }))
  )

  let saved = 0
  const chunkSize = 100
  for (let index = 0; index < rows.length; index += chunkSize) {
    const chunk = rows.slice(index, index + chunkSize)
    const { error } = await supabase.from("news_items").upsert(chunk, { onConflict: "id" })
    if (error) {
      return Response.json(
        {
          ok: false,
          saved,
          error: "Could not write news items.",
          sources: sources.map((source) => ({ source: source.source, count: source.items.length, error: source.error })),
        },
        { status: 500 }
      )
    }
    saved += chunk.length
  }

  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  await supabase.from("news_items").delete().lt("published_at", cutoff)

  return Response.json({
    ok: true,
    saved,
    sources: sources.map((source) => ({ source: source.source, count: source.items.length, error: source.error })),
  })
}
