"use client"

import Link from "next/link"
import { useMemo } from "react"
import { FolderOpen, ArrowRight, Code2 } from "lucide-react"
import { useSnippets } from "@/hooks/use-snippets"
import { getSnippetCounts } from "@/lib/snippet-stats"

const CONTAINER = "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"

export default function CategoriesPage() {
  const { allSnippets, allCategories, isLoaded } = useSnippets()
  const counts = useMemo(() => getSnippetCounts(allSnippets), [allSnippets])
  const rows = useMemo(
    () => allCategories.map((c) => ({ name: c, count: counts.byCategory[c] ?? 0 })).sort((a, b) => b.count - a.count),
    [allCategories, counts.byCategory]
  )

  return (
    <div className={CONTAINER}>
      <div className="animate-fade-up">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Categories</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Categories from your snippet library. Open Snippet Manager to create, edit, or filter snippets by category.
        </p>
      </div>

      {!isLoaded ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading categories...</p>
      ) : rows.length === 0 ? (
        <div className="mt-6 animate-fade-up rounded-xl border border-border bg-card p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background">
            <FolderOpen className="h-5 w-5 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-base font-semibold">No categories yet</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Add a category when creating or editing a snippet in Snippet Manager.
          </p>
          <Link href="/app/snippets" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity duration-150 hover:opacity-90">
            <Code2 className="h-4 w-4" /> Open Snippets
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((row, i) => (
              <Link
                key={row.name}
                href="/app/snippets"
                className={`animate-fade-up group rounded-xl border border-border bg-card p-4 transition-colors duration-150 hover:bg-muted/20 ${i % 3 === 1 ? "delay-1" : i % 3 === 2 ? "delay-2" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                      <FolderOpen className="h-4 w-4" />
                    </span>
                    <span className="truncate font-medium">{row.name}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{row.count} snippet{row.count === 1 ? "" : "s"}</p>
              </Link>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-border bg-background p-4">
            <p className="text-sm text-muted-foreground">
              Category filtering is managed in <Link href="/app/snippets" className="font-medium text-foreground underline-offset-4 hover:underline">Snippet Manager</Link>.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
