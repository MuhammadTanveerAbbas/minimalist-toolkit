"use client"

import type { Snippet } from "@/lib/types"
import { SnippetCard } from "./snippet-card"
import { FileCode, Plus } from "lucide-react"

interface SnippetListProps {
  snippets: Snippet[]
  onEdit: (snippet: Snippet) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onCopy: (snippet: Snippet) => void
  onView: (snippet: Snippet) => void
  onCreate: () => void
  hasFilters: boolean
}

export function SnippetList({
  snippets,
  onEdit,
  onDelete,
  onDuplicate,
  onCopy,
  onView,
  onCreate,
  hasFilters,
}: SnippetListProps) {
  if (snippets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-2 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card">
          <FileCode className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        </span>
        <h3 className="mt-4 text-base font-semibold">
          {hasFilters ? "No matching snippets" : "Your library is empty"}
        </h3>
        <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">
          {hasFilters
            ? "Nothing matches the current search and filters. Try widening them, or clear all filters to see everything."
            : "Save the code you keep rewriting. Tag it, categorise it, and it will be one search away next time."}
        </p>
        {!hasFilters ? (
          <button
            type="button"
            onClick={onCreate}
            className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create your first snippet
          </button>
        ) : null}
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {snippets.map((snippet) => (
        <SnippetCard
          key={snippet.id}
          snippet={snippet}
          onEdit={() => onEdit(snippet)}
          onDelete={() => onDelete(snippet.id)}
          onDuplicate={() => onDuplicate(snippet.id)}
          onCopy={() => onCopy(snippet)}
          onClick={() => onView(snippet)}
        />
      ))}
    </div>
  )
}
