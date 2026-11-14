"use client"

import { useMemo, useState } from "react"
import { Copy, Check, FileCode, Filter, Search, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LANGUAGE_NAMES } from "@/lib/editor-languages"
import type { SnippetFilters, Language } from "@/lib/types"
import { cn } from "@/lib/utils"

export type SnippetSort = "updated" | "created" | "title" | "lines"

interface SearchBarProps {
  filters: SnippetFilters
  onFiltersChange: (filters: SnippetFilters) => void
  allTags: string[]
  allCategories: string[]
  searchInputRef?: React.RefObject<HTMLInputElement | null>
  sort: SnippetSort
  onSortChange: (sort: SnippetSort) => void
}

const SORT_OPTIONS: { value: SnippetSort; label: string }[] = [
  { value: "updated", label: "Recently updated" },
  { value: "created", label: "Recently created" },
  { value: "title", label: "Title (A to Z)" },
  { value: "lines", label: "Longest first" },
]

export function SearchBar({
  filters,
  onFiltersChange,
  allTags,
  allCategories,
  searchInputRef,
  sort,
  onSortChange,
}: SearchBarProps) {
  const search = filters.search ?? ""
  const [copiedFilter, setCopiedFilter] = useState<string | null>(null)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value || undefined })
  }

  const clearSearch = () => onFiltersChange({ ...filters, search: undefined })
  const clearFilters = () => onFiltersChange({})

  const hasActiveFilters =
    !!filters.search ||
    !!filters.language ||
    !!filters.category ||
    (filters.tags && filters.tags.length > 0) ||
    !!filters.visibility

  const languages = Object.keys(LANGUAGE_NAMES) as Language[]

  const copyRegex = async () => {
    if (!filters.search) return
    try {
      await navigator.clipboard.writeText(filters.search)
      setCopiedFilter("regex")
      window.setTimeout(() => setCopiedFilter(null), 1600)
    } catch {
      // Clipboard may be unavailable. The field still holds the value.
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            ref={searchInputRef}
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search titles, descriptions, code and tags..."
            aria-label="Search snippets"
            className="h-11 w-full rounded-lg border border-border bg-card pl-9 pr-9 text-sm transition-colors placeholder:text-muted-foreground outline-none"
          />
          {search ? (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label="Filters"
              className={cn(
                "relative h-11 w-11 shrink-0 border-border bg-card",
                hasActiveFilters && "border-foreground/40 bg-accent"
              )}
            >
              <Filter className="h-4 w-4" aria-hidden="true" />
              {hasActiveFilters ? (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">Filters</p>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                  Clear all
                </button>
              ) : null}
            </div>
            <div className="max-h-[60vh] space-y-4 overflow-y-auto p-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Language
                </Label>
                <Select
                  value={filters.language ?? "all"}
                  onValueChange={(v) =>
                    onFiltersChange({ ...filters, language: v === "all" ? undefined : (v as Language) })
                  }
                >
                  <SelectTrigger className="h-9 text-sm bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    <SelectItem value="all">All languages</SelectItem>
                    {languages.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {LANGUAGE_NAMES[lang]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {allCategories.length > 0 ? (
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Category
                  </Label>
                  <Select
                    value={filters.category ?? "all"}
                    onValueChange={(v) =>
                      onFiltersChange({ ...filters, category: v === "all" ? undefined : v })
                    }
                  >
                    <SelectTrigger className="h-9 text-sm bg-card">
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {allCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Visibility
                </Label>
                <Select
                  value={filters.visibility ?? "all"}
                  onValueChange={(v) =>
                    onFiltersChange({
                      ...filters,
                      visibility: v === "all" ? undefined : (v as "public" | "private"),
                    })
                  }
                >
                  <SelectTrigger className="h-9 text-sm bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {allTags.length > 0 ? (
                <div className="space-y-2">
                  <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Tags
                  </Label>
                  <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg border border-border bg-surface-2 p-2">
                    {allTags.map((tag) => (
                      <div
                        key={tag}
                        className="flex items-center gap-2.5 rounded px-1 py-0.5 transition-colors hover:bg-accent"
                      >
                        <Checkbox
                          id={`tag-${tag}`}
                          checked={filters.tags?.includes(tag) ?? false}
                          onCheckedChange={(checked) => {
                            const current = filters.tags ?? []
                            const next = checked
                              ? [...current, tag]
                              : current.filter((t) => t !== tag)
                            onFiltersChange({ ...filters, tags: next.length > 0 ? next : undefined })
                          }}
                        />
                        <Label htmlFor={`tag-${tag}`} className="flex-1 cursor-pointer text-sm font-normal">
                          #{tag}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="flex items-center gap-2.5 rounded-lg border border-border bg-surface-2 px-2.5 py-2">
                <Checkbox
                  id="regex"
                  checked={filters.useRegex ?? false}
                  onCheckedChange={(checked) =>
                    onFiltersChange({ ...filters, useRegex: checked as boolean })
                  }
                />
                <Label htmlFor="regex" className="flex-1 cursor-pointer text-sm font-normal">
                  Use regular expression
                </Label>
                {filters.useRegex && filters.search ? (
                  <button
                    type="button"
                    onClick={copyRegex}
                    aria-label="Copy regular expression"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {copiedFilter === "regex" ? (
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                  </button>
                ) : null}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {hasActiveFilters ? (
        <div className="flex flex-wrap gap-1.5">
          {filters.search ? (
            <Badge variant="secondary" className="gap-1 text-xs">
              &ldquo;{filters.search}&rdquo;
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Remove search filter"
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </Badge>
          ) : null}
          {filters.language ? (
            <Badge variant="secondary" className="gap-1 text-xs">
              {LANGUAGE_NAMES[filters.language]}
              <button
                type="button"
                onClick={() => onFiltersChange({ ...filters, language: undefined })}
                aria-label="Remove language filter"
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </Badge>
          ) : null}
          {filters.category ? (
            <Badge variant="secondary" className="gap-1 text-xs">
              {filters.category}
              <button
                type="button"
                onClick={() => onFiltersChange({ ...filters, category: undefined })}
                aria-label="Remove category filter"
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </Badge>
          ) : null}
          {filters.visibility ? (
            <Badge variant="secondary" className="gap-1 text-xs capitalize">
              {filters.visibility}
              <button
                type="button"
                onClick={() => onFiltersChange({ ...filters, visibility: undefined })}
                aria-label="Remove visibility filter"
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </Badge>
          ) : null}
          {filters.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 text-xs">
              #{tag}
              <button
                type="button"
                onClick={() => {
                  const current = filters.tags ?? []
                  const next = current.filter((t) => t !== tag)
                  onFiltersChange({ ...filters, tags: next.length > 0 ? next : undefined })
                }}
                aria-label={`Remove ${tag} filter`}
                className="hover:text-destructive"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  )
}
