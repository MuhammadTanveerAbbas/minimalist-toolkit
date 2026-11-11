"use client"

import { documentTotals, formatMoney, isOverdue } from "@/lib/quotes/calculate"
import { formatDate, termsLabel } from "@/lib/quotes/format"
import type { QuoteDocument } from "@/lib/quotes/types"
import {
  DocumentClientBlock,
  DocumentFooter,
  DocumentHeader,
  DocumentItemsTable,
  DocumentNotes,
  DocumentSheet,
  DocumentTotals,
} from "./quote-document"

/** Print ready invoice document, with the due date and balance due called out. */
export function InvoiceDocumentView({
  quote,
  issuerEmail,
  className,
}: {
  quote: QuoteDocument
  issuerEmail: string | null
  className?: string
}) {
  const totals = documentTotals(quote)
  const overdue = isOverdue(totals.dueDate, quote.status)

  return (
    <DocumentSheet className={className}>
      <DocumentHeader
        kind="Invoice"
        number={quote.number}
        status={quote.status}
        issuerEmail={issuerEmail}
      />
      <DocumentClientBlock quote={quote} />

      <section className="mt-6 grid gap-3 rounded-lg border border-neutral-200 p-4 sm:grid-cols-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Payment terms
          </p>
          <p className="mt-1 text-sm text-neutral-900">{termsLabel(quote.terms)}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Due date
          </p>
          <p className="mt-1 text-sm tabular-nums text-neutral-900">{formatDate(totals.dueDate)}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            {totals.deposit > 0 ? "Balance due" : "Amount due"}
          </p>
          <p
            className={
              overdue
                ? "mt-1 text-sm font-semibold tabular-nums text-red-700"
                : "mt-1 text-sm font-semibold tabular-nums text-neutral-900"
            }
          >
            {formatMoney(totals.deposit > 0 ? totals.balance : totals.total, quote.currency)}
            {overdue ? " (overdue)" : ""}
          </p>
        </div>
      </section>

      <DocumentItemsTable quote={quote} />
      <DocumentTotals quote={quote} />
      <DocumentNotes quote={quote} />
      <DocumentFooter quote={quote} />
    </DocumentSheet>
  )
}
