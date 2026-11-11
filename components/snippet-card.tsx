"use client"

import type { Snippet } from "@/lib/types"
import { LANGUAGE_NAMES } from "@/lib/editor-languages"
import { Check, Copy, Edit, Eye, EyeOff, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SnippetCardProps {
  snippet: Snippet
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
  onCopy: () => void
  onClick: () => void
}

export function SnippetCard({
  snippet,
  onEdit,
  onDelete,
  onDuplicate,
  onCopy,
  onClick,
}: SnippetCardProps) {
  const isPublic = snippet.visibility === "public"
  const lineCount = snippet.code.split("\n").length

  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open snippet ${snippet.title}`}
      className="group relative flex cursor-pointer flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-foreground/25 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      {/* Action toolbar */}
      <div
        className="absolute right-3 top-3 flex items-center gap-0.5 rounded-lg border border-border bg-card/95 opacity-100 shadow-sm backdrop-blur-sm transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onCopy}
          title="Copy code"
          aria-label={`Copy code from ${snippet.title}`}
          className="flex h-8 w-8 items-center justify-center rounded-l-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onDuplicate}
          title="Duplicate"
          aria-label={`Duplicate ${snippet.title}`}
          className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Copy className="h-3.5 w-3.5 rotate-90" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onEdit}
          title="Edit"
          aria-label={`Edit ${snippet.title}`}
          className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Edit className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          title="Delete"
          aria-label={`Delete ${snippet.title}`}
          className="flex h-8 w-8 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-2 pr-24">
        <span
          className={cn(
            "inline-flex items-center gap-1 text-[11px] font-medium",
            isPublic ? "text-success" : "text-muted-foreground"
          )}
          title={isPublic ? "Public snippet" : "Private snippet"}
        >
          {isPublic ? (
            <Eye className="h-3 w-3" aria-hidden="true" />
          ) : (
            <EyeOff className="h-3 w-3" aria-hidden="true" />
          )}
          {isPublic ? "Public" : "Private"}
        </span>
        <span className="text-[11px] text-muted-foreground">·</span>
        <span className="truncate text-[11px] text-muted-foreground">
          {LANGUAGE_NAMES[snippet.language]}
        </span>
      </div>

      {/* Title + description */}
      <div className="space-y-1">
        <p className="line-clamp-1 pr-24 text-sm font-semibold leading-snug">{snippet.title}</p>
        {snippet.description ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{snippet.description}</p>
        ) : null}
      </div>

      {/* Tags */}
      {(snippet.tags.length > 0 || snippet.category) ? (
        <div className="flex flex-wrap gap-1">
          {snippet.category ? (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {snippet.category}
            </span>
          ) : null}
          {snippet.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
              #{tag}
            </span>
          ))}
          {snippet.tags.length > 3 ? (
            <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
              +{snippet.tags.length - 3}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* Footer */}
      <div className="flex items-center gap-3 border-t border-border pt-2.5 text-[10px] text-muted-foreground/70">
        <span>
          {new Date(snippet.updatedAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <span>{lineCount} lines</span>
        {snippet.versions.length > 0 ? (
          <span className="ml-auto inline-flex items-center gap-1">
            <Check className="h-3 w-3" aria-hidden="true" />
            {snippet.versions.length} version{snippet.versions.length !== 1 ? "s" : ""}
          </span>
        ) : null}
      </div>
    </div>
  )
}
