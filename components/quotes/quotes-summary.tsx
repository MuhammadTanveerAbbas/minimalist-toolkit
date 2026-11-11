"use client"

import { useMemo } from "react"
import { BarChart } from "@/components/charts"
import { documentTotals, formatMoney, isOverdue } from "@/lib/quotes/calculate"
import { statusLabel } from "@/lib/quotes/format"
import { QUOTE_STATUSES, type CurrencyCode, type QuoteDocument, type QuoteStatus } from "@/lib/quotes/types"
import { cn } from "@/lib/utils"

interface CurrencyStats {
  currency: CurrencyCode
  outstanding: number
  overdue: number
  invoiced: number
}

function monthKey(iso: string): string {
  return iso.slice(0, 7)
}

function lastMonths(count: number): { key: string; label: string }[] {
  const months: { key: string; label: string }[] = []
  const now = new Date()
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    months.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString(undefined, { month: "short" }),
    })
  }
  return months
}

/**
 * Real numbers taken from the saved documents: what is still owed, how much of
 * that is late, how documents are distributed by status, and how much was
 * invoiced each month over the last six months.
 */
export function QuotesSummary({
  documents,
  className,
}: {
  documents: QuoteDocument[]
  className?: string
}) {
  const stats = useMemo(() => {
    const invoices = documents.filter((doc) => doc.kind === "invoice")
    const byCurrency = new Map<CurrencyCode, CurrencyStats>()

    for (const invoice of invoices) {
      const totals = documentTotals(invoice)
      const entry = byCurrency.get(invoice.currency) ?? {
        currency: invoice.currency,
        outstanding: 0,
        overdue: 0,
        invoiced: 0,
      }
      entry.invoiced += totals.total
      if (invoice.status !== "paid") {
        entry.outstanding += totals.balance
        if (isOverdue(totals.dueDate, invoice.status)) entry.overdue += totals.balance
      }
      byCurrency.set(invoice.currency, entry)
    }

    const currencies = Array.from(byCurrency.values()).sort(
      (a, b) => b.outstanding - a.outstanding || b.invoiced - a.invoiced
    )
    const primary = currencies[0] ?? null

    const statusCounts = QUOTE_STATUSES.map((status) => ({
      status,
      count: documents.filter((doc) => doc.status === status).length,
    })).filter((row) => row.count > 0)

    const months = lastMonths(6)
    const monthly = months.map((month) => ({
      label: month.label,
      hint: month.key,
      value: invoices
        .filter((doc) => monthKey(doc.issuedOn) === month.key && (!primary || doc.currency === primary.currency))
        .reduce((sum, doc) => sum + documentTotals(doc).total, 0),
    }))

    return {
      currencies,
      primary,
      statusCounts,
      monthly,
      quoteCount: documents.filter((doc) => doc.kind === "quote").length,
      invoiceCount: invoices.length,
    }
  }, [documents])

  if (documents.length === 0) {
    return (
      <div
        className={cn(
          "rounded-xl border border-dashed border-border bg-surface-2 p-4 text-sm text-muted-foreground",
          className
        )}
      >
        Save a quote or an invoice and this panel will show what you are owed, what is late, and how
        much you have invoiced each month.
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Outstanding balance"
          value={stats.primary ? formatMoney(stats.primary.outstanding, stats.primary.currency) : "0"}
          hint={
            stats.primary && stats.currencies.length > 1
              ? `${stats.primary.currency} only, other currencies listed below`
              : "Invoices that are not paid yet"
          }
        />
        <StatCard
          label="Overdue"
          value={stats.primary ? formatMoney(stats.primary.overdue, stats.primary.currency) : "0"}
          hint="Past the agreed due date"
          tone={stats.primary && stats.primary.overdue > 0 ? "danger" : "default"}
        />
        <StatCard
          label="Invoiced"
          value={
            stats.primary ? formatMoney(stats.primary.invoiced, stats.primary.currency) : "0"
          }
          hint={`${stats.invoiceCount} invoice${stats.invoiceCount === 1 ? "" : "s"} and ${
            stats.quoteCount
          } quote${stats.quoteCount === 1 ? "" : "s"}`}
        />
        <StatCard
          label="By status"
          value={
            <span className="flex flex-wrap gap-1.5">
              {stats.statusCounts.length === 0 ? (
                <span className="text-sm text-muted-foreground">None</span>
              ) : (
                stats.statusCounts.map((row) => (
                  <span
                    key={row.status}
                    className="rounded-md border border-border bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium"
                  >
                    {statusLabel(row.status)} {row.count}
                  </span>
                ))
              )}
            </span>
          }
          hint="Saved documents"
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">Invoiced per month</h3>
          <span className="text-xs text-muted-foreground">Last 6 months</span>
        </div>
        {stats.primary ? (
          <>
            <BarChart
              className="mt-4"
              data={stats.monthly}
              formatValue={(value) => formatMoney(value, stats.primary!.currency)}
            />
            {stats.currencies.length > 1 ? (
              <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
                {stats.currencies.map((entry) => (
                  <li key={entry.currency}>
                    {entry.currency}: {formatMoney(entry.outstanding, entry.currency)} outstanding
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            No invoices yet. The monthly chart starts once you convert a quote into an invoice.
          </p>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string
  value: React.ReactNode
  hint?: string
  tone?: "default" | "danger"
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-2 text-2xl font-semibold tracking-tight tabular-nums",
          tone === "danger" && "text-destructive"
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
