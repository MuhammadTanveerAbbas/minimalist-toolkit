"use client"

import { useState, useMemo } from "react"
import { Clock, Copy, Check, ChevronRight, Trash2, Search, X, ImageOff } from "lucide-react"
import type { HistoryItem } from "@/lib/mockify/history"

export type { HistoryItem }

interface PromptHistoryProps {
  items: HistoryItem[]
  onSelect: (item: HistoryItem) => void
  onDelete: (id: string) => void
  onClearAll: () => void
}

function HistoryCard({
  item,
  onSelect,
  onDelete,
}: {
  item: HistoryItem
  onSelect: () => void
  onDelete: () => void
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(item.prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete()
  }

  const timeLabel = item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  const hasImage = item.imageUrl.length > 0

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect()
        }
      }}
      aria-label={`Open generation: ${item.prompt}`}
      className="group flex w-full cursor-pointer items-start gap-3 rounded-xl border border-border/80 bg-card p-4 text-left transition-all hover:border-ring/40 hover:bg-accent outline-none"
    >
      {hasImage ? (
        /* eslint-disable-next-line @next/next/no-img-element -- generated/remote preview URLs */
        <img
          src={item.imageUrl}
          alt={item.prompt}
          className="h-14 w-14 shrink-0 rounded-lg object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        />
      ) : (
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-border bg-muted"
          title="Image not stored in this browser"
        >
          <ImageOff className="h-4 w-4 text-muted-foreground/50" aria-hidden="true" />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="truncate text-xs font-semibold text-foreground">{item.prompt}</span>
          <span className="rounded-md border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {item.model}
          </span>
          <span className="rounded-md border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {item.size}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/40">
          <span className="flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" aria-hidden="true" />
            {timeLabel}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 pt-0.5">
        <button
          onClick={handleCopy}
          title="Copy prompt"
          aria-label="Copy prompt to clipboard"
          type="button"
          className="min-h-11 min-w-11 rounded-lg p-2 text-muted-foreground opacity-100 sm:opacity-0 transition-all sm:group-hover:opacity-100 hover:bg-secondary hover:text-foreground"
        >
          {copied ? <Check className="h-3 w-3 text-muted-foreground" aria-hidden="true" /> : <Copy className="h-3 w-3" aria-hidden="true" />}
        </button>
        <button
          onClick={handleDelete}
          title="Delete"
          aria-label="Delete this generation"
          type="button"
          className="min-h-11 min-w-11 rounded-lg p-2 text-muted-foreground opacity-100 sm:opacity-0 transition-all sm:group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" aria-hidden="true" />
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 opacity-0 transition-all group-hover:opacity-100" aria-hidden="true" />
      </div>
    </div>
  )
}

export function PromptHistory({ items, onSelect, onDelete, onClearAll }: PromptHistoryProps) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter(
      (i) =>
        i.prompt.toLowerCase().includes(q) ||
        i.model.toLowerCase().includes(q) ||
        i.size.toLowerCase().includes(q)
    )
  }, [items, search])

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border/60 bg-card py-20 text-center px-4">
        <div className="rounded-2xl border border-border/60 bg-secondary/40 p-4">
          <Clock className="h-5 w-5 text-muted-foreground/40" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">No generations yet</p>
          <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground/60">
            Every image you generate is listed here with its prompt, model and size,
            so you can reopen an earlier result at any time.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/40" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search history..."
            aria-label="Search generation history"
            className="w-full min-h-11 rounded-lg border border-border bg-background/60 py-2 pl-8 pr-8 text-xs text-foreground placeholder:text-muted-foreground/35 outline-none transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground"
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onClearAll}
          className="shrink-0 min-h-11 rounded-lg border border-border/60 bg-secondary/40 px-3 py-2 text-xs font-medium text-muted-foreground transition-all hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
        >
          Clear all
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-xs text-muted-foreground/50">
          No results for &ldquo;{search}&rdquo;
        </p>
      ) : (
        <div className="flex flex-col gap-2.5" role="list" aria-label="Generation history">
          {filtered.map((item) => (
            <div key={item.id} role="listitem">
              <HistoryCard
                item={item}
                onSelect={() => onSelect(item)}
                onDelete={() => onDelete(item.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
