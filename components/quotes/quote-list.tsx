"use client"

import { useMemo, useState } from "react"
import { AlertCircle, FileText, Plus, Receipt, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { documentTotals, formatMoney, isOverdue } from "@/lib/quotes/calculate"
import { statusLabel } from "@/lib/quotes/format"
import { QUOTE_STATUSES, type QuoteEntry, type QuoteStatus } from "@/lib/quotes/types"
import { cn } from "@/lib/utils"

const STATUS_FILTERS: Array<{ id: QuoteStatus | "all"; label: string }> = [
  { id: "all", label: "All" },
  ...QUOTE_STATUSES.map((status) => ({ id: status, label: statusLabel(status) })),
]

const STATUS_BADGE_CLASS: Record<QuoteStatus, string> = {
  draft: "border-border bg-surface-2 text-muted-foreground",
  sent: "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-200",
  accepted:
    "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  declined:
    "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
  paid: "border-emerald-400 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
}

export function QuoteList({
  entries,
  loading,
  activeRowId,
  onSelect,
  onCreate,
}: {
  entries: QuoteEntry[]
  loading: boolean
  activeRowId: string | null
  onSelect: (entry: QuoteEntry) => void
  onCreate: (kind: "quote" | "invoice") => void
}) {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<QuoteStatus | "all">("all")

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return entries.filter((entry) => {
      if (status !== "all" && entry.document.status !== status) return false
      if (!needle) return true
      const { number, client } = entry.document
      return (
        number.toLowerCase().includes(needle) ||
        client.name.toLowerCase().includes(needle) ||
        client.company.toLowerCase().includes(needle)
      )
    })
  }, [entries, query, status])

  const isFiltering = query.trim().length > 0 || status !== "all"

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-3 border-b border-border p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-tight">Documents</h2>
          <Button size="sm" onClick={() => onCreate("quote")} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            New quote
          </Button>
        </div>

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search number or client"
            aria-label="Search quotes and invoices"
            className="pl-8"
          />
        </div>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((filter) => {
            const active = filter.id === status
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setStatus(filter.id)}
                aria-pressed={active}
                className={cn(
                  "rounded-md border px-2 py-1 text-[11px] font-medium transition-colors duration-150",
                  active
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                {filter.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {loading ? (
          <ul className="space-y-2">
            {[0, 1, 2, 3].map((index) => (
              <li key={index} className="rounded-lg border border-border p-3">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="mt-2 h-3 w-36" />
                <Skeleton className="mt-3 h-3 w-16" />
              </li>
            ))}
          </ul>
        ) : entries.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface-2 p-4 text-center">
            <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card">
              <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </span>
            <p className="mt-3 text-sm font-medium">No quotes yet</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Build a quote with line items, tax, deposit and payment terms, then convert it to an
              invoice when the client says yes.
            </p>
            <Button size="sm" onClick={() => onCreate("quote")} className="mt-3 gap-1.5">
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Create your first quote
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface-2 p-4 text-center">
            <p className="text-sm font-medium">Nothing matches</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {isFiltering
                ? "No document matches the current search and status filter."
                : "No documents to show."}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map((entry) => {
              const { document } = entry
              const totals = documentTotals(document)
              const overdue =
                document.kind === "invoice" &&
                isOverdue(totals.dueDate, document.status)
              const active = entry.rowId === activeRowId
              return (
                <li key={entry.rowId}>
                  <button
                    type="button"
                    onClick={() => onSelect(entry)}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "w-full rounded-lg border p-3 text-left transition-colors duration-150",
                      active
                        ? "border-foreground/30 bg-surface-2"
                        : "border-border bg-card hover:bg-surface-2"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-1.5">
                        {document.kind === "invoice" ? (
                          <Receipt className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                        ) : (
                          <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                        )}
                        <span className="truncate text-sm font-medium tabular-nums">
                          {document.number}
                        </span>
                      </span>
                      <Badge
                        variant="outline"
                        className={cn("shrink-0 text-[10px]", STATUS_BADGE_CLASS[document.status])}
                      >
                        {statusLabel(document.status)}
                      </Badge>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {document.client.name || document.client.company || "No client yet"}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold tabular-nums">
                        {formatMoney(totals.total, document.currency)}
                      </span>
                      {overdue ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-destructive">
                          <AlertCircle className="h-3 w-3" aria-hidden="true" />
                          Overdue
                        </span>
                      ) : null}
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
