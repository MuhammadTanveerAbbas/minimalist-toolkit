"use client"

import { useState } from "react"
import { Sparkles, Loader2, Link2, X, CheckCircle, AlertCircle, MessageSquare, Sparkle, Gem, Zap as ZapIcon, MousePointer2, Bot, LayoutTemplate } from "lucide-react"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  "Assistant",
  "Creative Writing",
  "Code & Dev",
  "Business",
  "Research",
  "Marketing",
  "Education",
  "Legal",
  "Healthcare",
  "Social Media",
]

const TONES = [
  "Professional",
  "Creative",
  "Technical",
  "Casual",
  "Formal",
  "Instructive",
  "Persuasive",
  "Empathetic",
  "Concise",
  "Storytelling",
]

const PLATFORMS: { id: string; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "ChatGPT",     label: "ChatGPT",     Icon: MessageSquare },
  { id: "Claude",      label: "Claude",      Icon: Sparkle },
  { id: "Gemini",      label: "Gemini",      Icon: Gem },
  { id: "Mistral",     label: "Mistral",     Icon: ZapIcon },
  { id: "Cursor",      label: "Cursor",      Icon: MousePointer2 },
  { id: "Grok",       label: "Grok",        Icon: Bot },
]

export interface PromptTemplate {
  label: string
  topic: string
  tone: string
  category: string
  platform: string
}

/**
 * Ready-made starting points. Each one fills every field so the user can
 * generate straight away, then tune it.
 */
const TEMPLATES: PromptTemplate[] = [
  {
    label: "SaaS onboarding email",
    topic: "Write a welcome onboarding email for a new user of our SaaS analytics product",
    tone: "Persuasive",
    category: "Marketing",
    platform: "ChatGPT",
  },
  {
    label: "Technical documentation",
    topic: "Write reference documentation for a public REST API endpoint, including auth, request and response examples",
    tone: "Technical",
    category: "Code & Dev",
    platform: "Claude",
  },
  {
    label: "Ad creative for a launch",
    topic: "Create three ad variations for a product launch, one per channel, with headline, body and call to action",
    tone: "Persuasive",
    category: "Marketing",
    platform: "Gemini",
  },
  {
    label: "Bug report for an LLM",
    topic: "Write a precise bug report for an LLM integration, with reproducible steps, expected output and actual output",
    tone: "Technical",
    category: "Code & Dev",
    platform: "Cursor",
  },
]

export interface GenerateParams {
  topic: string
  tone: string
  category: string
  context: string
  platform: string
}

interface PromptFormProps {
  onGenerate: (params: GenerateParams) => void
  isLoading: boolean
}

type ScrapeStatus = "idle" | "loading" | "success" | "error"

function FieldLabel({
  htmlFor,
  children,
  optional,
}: {
  htmlFor?: string
  children: React.ReactNode
  optional?: boolean
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex items-center gap-2 text-xs font-medium text-foreground/70"
    >
      {children}
      {optional && (
        <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground/50">
          optional
        </span>
      )}
    </label>
  )
}

export function PromptForm({ onGenerate, isLoading }: PromptFormProps) {
  const [topic, setTopic] = useState("")
  const [tone, setTone] = useState("Professional")
  const [category, setCategory] = useState("Assistant")
  const [platform, setPlatform] = useState("")
  const [context, setContext] = useState("")
  const [urlInput, setUrlInput] = useState("")
  const [scrapeStatus, setScrapeStatus] = useState<ScrapeStatus>("idle")
  const [scrapeError, setScrapeError] = useState("")
  const [scrapedSource, setScrapedSource] = useState("")

  const applyTemplate = (template: PromptTemplate) => {
    setTopic(template.topic)
    setTone(template.tone)
    setCategory(template.category)
    setPlatform(template.platform)
  }

  const handleScrape = async () => {
    const trimmedUrl = urlInput.trim()
    if (!trimmedUrl) return
    setScrapeStatus("loading")
    setScrapeError("")
    setScrapedSource("")
    try {
      const res = await fetch("/api/promptcraft/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmedUrl }),
      })
      const data = await res.json()
      if (!res.ok || data.error) {
        setScrapeStatus("error")
        setScrapeError(data.error ?? "Failed to scrape URL")
        return
      }
      const scraped = `[Scraped from ${data.title}]:\n${data.content}`
      setContext((prev) => (prev ? `${prev}\n\n${scraped}` : scraped))
      setScrapedSource(data.title)
      setScrapeStatus("success")
    } catch {
      setScrapeStatus("error")
      setScrapeError("Network error - could not reach the URL")
    }
  }

  const clearScrape = () => {
    const source = scrapedSource
    setUrlInput("")
    setScrapeStatus("idle")
    setScrapeError("")
    setScrapedSource("")
    if (source) {
      const prefix = `[Scraped from ${source}]:`
      setContext((prev) =>
        prev
          .split("\n\n")
          .filter((block) => !block.startsWith(prefix))
          .join("\n\n")
          .trim()
      )
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim() || isLoading) return
    onGenerate({ topic: topic.trim(), tone, category, platform, context: context.trim() })
  }

  const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleScrape()
    }
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-background/60 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/35 focus:border-foreground/25 focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all"

  const chipClass = (active: boolean) =>
    cn(
      "rounded-lg border px-3 py-2 text-xs font-medium transition-all cursor-pointer select-none min-h-11",
      active
        ? "border-foreground/20 bg-foreground text-background"
        : "border-border/70 bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-border"
    )

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border/50 px-4 py-4 sm:px-6">
        <h2 className="text-sm font-semibold text-foreground">Prompt details</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Describe your goal, choose options, then generate.
        </p>
      </div>

      {/* Scrollable fields */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:gap-5 sm:px-6 sm:py-5">

        {/* Templates */}
        <div className="flex flex-col gap-2">
          <FieldLabel>
            <LayoutTemplate className="h-3.5 w-3.5 text-muted-foreground/50" aria-hidden="true" />
            Start from a template
          </FieldLabel>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Prompt templates">
            {TEMPLATES.map((template) => (
              <button
                key={template.label}
                type="button"
                onClick={() => applyTemplate(template)}
                className="rounded-lg border border-border/70 bg-secondary/40 px-3 py-2 text-xs font-medium text-muted-foreground transition-all hover:border-border hover:bg-secondary hover:text-foreground min-h-11"
              >
                {template.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground/50">
            A template fills the topic, tone, category and platform. Edit anything before
            generating.
          </p>
        </div>

        {/* Topic */}
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="topic">Topic / Goal</FieldLabel>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Write landing page copy for a SaaS product"
            maxLength={500}
            className={inputClass}
            required
          />
        </div>

        {/* Platform */}
        <div className="flex flex-col gap-2.5">
          <FieldLabel optional>
            Target Platform
          </FieldLabel>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label="Select target platform">
            {PLATFORMS.map((p) => {
              const active = platform === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlatform(active ? "" : p.id)}
                  aria-pressed={active}
                  className={cn(
                    "relative flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-[11px] font-medium transition-all cursor-pointer select-none min-h-11",
                    active
                      ? "border-foreground/20 bg-foreground text-background"
                      : "border-border/70 bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground hover:border-border"
                  )}
                >
                  <p.Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {p.label}
                </button>
              )
            })}
          </div>
          {platform && (
            <p className="text-[11px] text-muted-foreground/50">
              Prompt will be optimised for{" "}
              <span className="font-medium text-muted-foreground">{platform}</span>&apos;s strengths and syntax.
            </p>
          )}
        </div>

        {/* Category */}
        <div className="flex flex-col gap-2.5">
          <FieldLabel>Category</FieldLabel>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Select category">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                aria-pressed={category === cat}
                className={chipClass(category === cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div className="flex flex-col gap-2.5">
          <FieldLabel>Tone</FieldLabel>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Select tone">
            {TONES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTone(t)}
                aria-pressed={tone === t}
                className={chipClass(tone === t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/40" />

        {/* Context */}
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="context" optional>
            Additional Context
          </FieldLabel>
          <textarea
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Target audience, constraints, examples, format preferences..."
            rows={3}
            maxLength={2000}
            className={cn(inputClass, "resize-none leading-relaxed")}
          />
        </div>

        {/* URL Scraper */}
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="url" optional>
            <Link2 className="h-3.5 w-3.5 text-muted-foreground/50" aria-hidden="true" />
            Scrape URL into context
          </FieldLabel>
          <div className="flex gap-2">
            <input
              id="url"
              type="url"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value)
                if (scrapeStatus !== "idle") {
                  setScrapeStatus("idle")
                  setScrapeError("")
                }
              }}
              onKeyDown={handleUrlKeyDown}
              placeholder="https://example.com/article"
              className={cn(inputClass, "min-w-0 flex-1 text-[13px]")}
            />
            <button
              type="button"
              onClick={handleScrape}
              disabled={scrapeStatus === "loading" || !urlInput.trim()}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-2.5 text-xs font-medium text-foreground transition-all hover:bg-accent hover:border-foreground/20 disabled:cursor-not-allowed disabled:opacity-40 min-h-11 min-w-11 sm:min-w-0"
            >
              {scrapeStatus === "loading" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">{scrapeStatus === "loading" ? "Scraping..." : "Scrape"}</span>
            </button>
          </div>

          {scrapeStatus === "success" && (
            <div className="flex items-center justify-between rounded-lg border border-success/25 bg-success/[0.07] px-3 py-2">
              <div className="flex items-center gap-2 text-xs text-foreground/80">
                <CheckCircle className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
                Scraped <span className="font-medium text-foreground">{scrapedSource}</span> - added to context
              </div>
              <button
                type="button"
                onClick={clearScrape}
                className="ml-3 shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Clear scraped content"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          )}

          {scrapeStatus === "error" && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-destructive/25 bg-destructive/[0.07] px-3 py-2 text-xs text-destructive-foreground/80"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-destructive-foreground" aria-hidden="true" />
              {scrapeError}
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="border-t border-border/50 px-4 py-4 sm:px-6">
        <button
          type="submit"
          disabled={isLoading || !topic.trim()}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-opacity duration-150 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Generate Prompt
            </>
          )}
        </button>
      </div>
    </form>
  )
}
