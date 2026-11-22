// Server-side collection of AI news from open, keyless (or optionally keyed) APIs.
// Server-only: never import this from a client component.

import { XMLParser } from "fast-xml-parser"

const HN_SEARCH_URL = "https://hn.algolia.com/api/v1/search_by_date"
const ARXIV_API_URL = "https://export.arxiv.org/api/query"
const GITHUB_SEARCH_URL = "https://api.github.com/search/repositories"
const HF_MODELS_URL = "https://huggingface.co/api/models"
const HF_PAPERS_URL = "https://huggingface.co/api/daily_papers"

export type NewsSourceId =
  | "hacker-news"
  | "arxiv"
  | "github"
  | "huggingface"

export interface NewsItem {
  id: string
  source: NewsSourceId
  title: string
  url: string
  summary: string
  author: string | null
  publishedAt: string
  score: number | null
  tags: string[]
}

export interface NewsSourceResult {
  source: NewsSourceId
  items: NewsItem[]
  error: string | null
}

export const SOURCE_LABELS: Record<NewsSourceId, string> = {
  "hacker-news": "Hacker News",
  arxiv: "arXiv",
  github: "GitHub",
  huggingface: "Hugging Face",
}

function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return ""
  const trimmed = value.replace(/\s+/g, " ").trim()
  return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength - 1)}…` : trimmed
}

function validUrl(value: unknown): string | null {
  if (typeof value !== "string") return null
  try {
    const parsed = new URL(value)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null
    return value.length <= 2048 ? value : null
  } catch {
    return null
  }
}

function validDate(value: unknown): string | null {
  if (typeof value !== "string") return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

function dedupe(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>()
  const result: NewsItem[] = []
  for (const item of items) {
    if (seen.has(item.id)) continue
    seen.add(item.id)
    result.push(item)
  }
  return result
}

async function fetchJson(url: string, init: RequestInit, timeoutMs: number): Promise<any> {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  return response.json()
}

async function fetchText(url: string, init: RequestInit, timeoutMs: number): Promise<string> {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  return response.text()
}

function humanizeError(source: string, error: unknown): string {
  if (error instanceof Error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return `${source} did not respond in time.`
    }
    const match = /HTTP (\d+)/.exec(error.message)
    if (match) return `${source} returned ${match[1]}.`
  }
  return `${source} could not be reached.`
}

async function fetchHackerNews(): Promise<NewsSourceResult> {
  const source: NewsSourceId = "hacker-news"
  const sourceLabel = "Hacker News"
  try {
    const url = `${HN_SEARCH_URL}?query=AI&tags=story&hitsPerPage=25`
    const json = await fetchJson(url, {}, 12_000)
    const hits = Array.isArray(json?.hits) ? json.hits : []
    const items: NewsItem[] = []
    for (const hit of hits) {
      const title = cleanText(hit?.title, 500)
      if (!title) continue
      const publishedAt = validDate(hit?.created_at)
      if (!publishedAt) continue
      const urlValue = validUrl(hit?.url) ?? `https://news.ycombinator.com/item?id=${hit?.objectID}`
      if (!urlValue) continue
      const score = typeof hit?.points === "number" ? hit.points : null
      items.push({
        id: `hn:${hit?.objectID}`,
        source,
        title,
        url: urlValue,
        summary: "",
        author: cleanText(hit?.author, 200) || null,
        publishedAt,
        score: score != null && score >= 0 ? score : null,
        tags: [],
      })
    }
    return { source, items: dedupe(items).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)), error: null }
  } catch (error) {
    return { source, items: [], error: humanizeError(sourceLabel, error) }
  }
}

async function fetchArxiv(): Promise<NewsSourceResult> {
  const source: NewsSourceId = "arxiv"
  const sourceLabel = "arXiv"
  try {
    const url = `${ARXIV_API_URL}?search_query=cat:cs.AI+OR+cat:cs.LG&sortBy=submittedDate&sortOrder=descending&max_results=25`
    const text = await fetchText(
      url,
      {
        headers: {
          "User-Agent": `MinimalistToolkit/1.0 (+${process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000"})`,
        },
      },
      15_000
    )

    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" })
    const parsed = parser.parse(text)
    const feed = parsed?.feed ?? {}
    const rawEntries = feed.entry
    const entries = Array.isArray(rawEntries) ? rawEntries : rawEntries ? [rawEntries] : []

    const items: NewsItem[] = []
    for (const entry of entries) {
      const title = cleanText(entry?.title, 500)
      if (!title) continue
      const publishedAt = validDate(entry?.published)
      if (!publishedAt) continue

      const authorsRaw = entry?.author
      const authorObjects = Array.isArray(authorsRaw) ? authorsRaw : authorsRaw ? [authorsRaw] : []
      const authors = authorObjects.map((value: any) => (typeof value === "string" ? value : value?.name))
      const author = cleanText(authors.filter(Boolean).join(", "), 200) || null

      const links = Array.isArray(entry?.link) ? entry.link : entry?.link ? [entry.link] : []
      const alternate = links.find((link: any) => link?.["@_rel"] === "alternate") ?? links[0]
      const urlValue = validUrl(alternate?.["@_href"])
      if (!urlValue) continue

      const idValue = cleanText(entry?.id, 200)
      if (!idValue) continue

      const categoriesRaw = entry?.category
      const categories = Array.isArray(categoriesRaw) ? categoriesRaw : categoriesRaw ? [categoriesRaw] : []
      const tags = categories
        .map((category: any) => (typeof category?.["@_term"] === "string" ? category["@_term"] : null))
        .filter((value): value is string => Boolean(value))

      items.push({
        id: `arxiv:${idValue}`,
        source,
        title,
        url: urlValue,
        summary: cleanText(entry?.summary, 1000),
        author,
        publishedAt,
        score: null,
        tags,
      })
    }

    return { source, items: dedupe(items).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)), error: null }
  } catch (error) {
    return { source, items: [], error: humanizeError(sourceLabel, error) }
  }
}

async function fetchGitHub(): Promise<NewsSourceResult> {
  const source: NewsSourceId = "github"
  const sourceLabel = "GitHub"
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const url = `${GITHUB_SEARCH_URL}?q=${encodeURIComponent(`topic:artificial-intelligence created:>=${since}`)}&sort=stars&order=desc&per_page=20`
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    }
    const token = process.env.GITHUB_TOKEN?.trim()
    if (token) headers.Authorization = `Bearer ${token}`

    const json = await fetchJson(url, { headers }, 12_000)
    const itemsRaw = Array.isArray(json?.items) ? json.items : []
    const items: NewsItem[] = []
    for (const repo of itemsRaw) {
      const fullName = cleanText(repo?.full_name, 200)
      if (!fullName) continue
      const urlValue = validUrl(repo?.html_url)
      if (!urlValue) continue
      const publishedAt = validDate(repo?.created_at)
      if (!publishedAt) continue
      const topics = Array.isArray(repo?.topics) ? repo.topics.filter((t: unknown) => typeof t === "string") : []
      items.push({
        id: `gh:${fullName}`,
        source,
        title: fullName,
        url: urlValue,
        summary: cleanText(repo?.description, 1000),
        author: cleanText(repo?.owner?.login, 200) || null,
        publishedAt,
        score: typeof repo?.stargazers_count === "number" ? repo.stargazers_count : null,
        tags: topics.slice(0, 8),
      })
    }
    return { source, items: dedupe(items).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)), error: null }
  } catch (error) {
    return { source, items: [], error: humanizeError(sourceLabel, error) }
  }
}

async function fetchHfPapers(): Promise<NewsItem[]> {
  try {
    const json = await fetchJson(`${HF_PAPERS_URL}?limit=20`, {}, 12_000)
    const papers = Array.isArray(json) ? json : []
    const items: NewsItem[] = []
    for (const entry of papers) {
      const paper = entry?.paper ?? {}
      const id = cleanText(paper?.id, 100)
      const title = cleanText(paper?.title, 500)
      const urlValue = validUrl(`https://huggingface.co/papers/${id}`)
      const publishedAt = validDate(entry?.publishedAt ?? paper?.publishedAt)
      if (!id || !title || !urlValue || !publishedAt) continue
      items.push({
        id: `hf-paper:${id}`,
        source: "huggingface",
        title,
        url: urlValue,
        summary: "",
        author: null,
        publishedAt,
        score: null,
        tags: [],
      })
    }
    return dedupe(items)
  } catch {
    return []
  }
}

async function fetchHuggingFace(): Promise<NewsSourceResult> {
  const source: NewsSourceId = "huggingface"
  const sourceLabel = "Hugging Face"
  try {
    const url = `${HF_MODELS_URL}?sort=createdAt&direction=-1&limit=20`
    const json = await fetchJson(url, {}, 12_000)
    const models = Array.isArray(json) ? json : []
    const items: NewsItem[] = []
    for (const model of models) {
      const id = cleanText(model?.id, 200)
      const urlValue = validUrl(`https://huggingface.co/${id}`)
      const publishedAt = validDate(model?.createdAt)
      if (!id || !urlValue || !publishedAt) continue
      items.push({
        id: `hf:${id}`,
        source,
        title: id,
        url: urlValue,
        summary: "",
        author: null,
        publishedAt,
        score: null,
        tags: [],
      })
    }
    const papers = await fetchHfPapers()
    const all = dedupe([...items, ...papers]).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    return { source, items: all, error: null }
  } catch (error) {
    return { source, items: [], error: humanizeError(sourceLabel, error) }
  }
}

export async function fetchAllNews(): Promise<NewsSourceResult[]> {
  const results = await Promise.allSettled([
    fetchHackerNews(),
    fetchArxiv(),
    fetchGitHub(),
    fetchHuggingFace(),
  ])

  const mapped: NewsSourceResult[] = results.map((result, index) => {
    if (result.status === "fulfilled") return result.value
    const sources: NewsSourceId[] = ["hacker-news", "arxiv", "github", "huggingface"]
    const labels = ["Hacker News", "arXiv", "GitHub", "Hugging Face"]
    return {
      source: sources[index],
      items: [],
      error: `${labels[index]} could not be reached.`,
    }
  })

  // Cross-source deduplication by id.
  const seen = new Set<string>()
  for (const result of mapped) {
    const filtered: NewsItem[] = []
    for (const item of result.items) {
      if (seen.has(item.id)) continue
      seen.add(item.id)
      filtered.push(item)
    }
    result.items = filtered
  }

  return mapped
}
