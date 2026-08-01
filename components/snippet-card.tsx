"use client"

import type { Snippet } from "@/lib/types"
import { LANGUAGE_NAMES } from "@/lib/editor-languages"
import { Edit, Trash2, Eye, EyeOff, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

interface SnippetCardProps {
  snippet: Snippet
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
  onClick: () => void
}

export function SnippetCard({ snippet, onEdit, onDelete, onDuplicate, onClick }: SnippetCardProps) {
  const isPublic = snippet.visibility === "public"

  return (
    <div
      onClick={onClick}
      className="group relative flex flex-col gap-3 p-4 rounded-xl border border-border bg-card hover:border-foreground/20 hover:shadow-md transition-all cursor-pointer"
    >
      {/* ── Top-right action toolbar ── */}
      <div
        className="absolute top-3 right-3 flex items-center gap-px rounded-lg border border-border bg-background/90 backdrop-blur-sm shadow-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Visibility badge */}
        <span className={cn(
          "flex items-center gap-1 px-2 py-1.5 text-[10px] font-semibold border-r border-border",
          isPublic
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-muted-foreground"
        )}>
          {isPublic ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          <span className="hidden sm:inline capitalize">{snippet.visibility}</span>
        </span>

        {/* Duplicate */}
        <button
          onClick={onDuplicate}
          title="Duplicate"
          className="flex items-center justify-center px-2 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>

        {/* Edit */}
        <button
          onClick={onEdit}
          title="Edit"
          className="flex items-center justify-center px-2 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          <Edit className="h-3.5 w-3.5" />
        </button>

        {/* Delete */}
        <button
          onClick={onDelete}
          title="Delete"
          className="flex items-center justify-center px-2 py-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Language */}
      <div className="flex items-center gap-2 pr-28 sm:pr-36">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground/40 shrink-0" />
          {LANGUAGE_NAMES[snippet.language]}
        </span>
      </div>

      {/* Title + description */}
      <div className="space-y-1">
        <p className="text-sm font-semibold leading-snug line-clamp-1 pr-28 sm:pr-36">{snippet.title}</p>
        {snippet.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{snippet.description}</p>
        )}
      </div>

      {/* Tags */}
      {(snippet.tags.length > 0 || snippet.category) && (
        <div className="flex flex-wrap gap-1">
          {snippet.category && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              {snippet.category}
            </span>
          )}
          {snippet.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">
              #{tag}
            </span>
          ))}
          {snippet.tags.length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">
              +{snippet.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50 pt-1 border-t border-border/50">
        <span>{new Date(snippet.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
        {snippet.versions.length > 0 && (
          <span className="ml-auto">{snippet.versions.length} version{snippet.versions.length !== 1 ? "s" : ""}</span>
        )}
      </div>
    </div>
  )
}
