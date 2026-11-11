"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { documentTotals, formatMoney } from "@/lib/quotes/calculate"
import { formatDate, formatQuantity, statusLabel, termsLabel } from "@/lib/quotes/format"
import type { QuoteDocument, QuoteStatus } from "@/lib/quotes/types"
import { cn } from "@/lib/utils"

/**
 * Reads the signed in user email so a document can name who issued it. When
 * Supabase is not configured or the visitor is not signed in the email stays
 * null and the issuer block simply omits it.
 */
export function useIssuerEmail(): string | null {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const supabase = createClient()
    void supabase.auth
      .getUser()
      .then(({ data }: { data: { user?: { email?: string | null } | null } | null }) => {
        if (!active) return
        setEmail(data?.user?.email ?? null)
      })
      .catch(() => {
        if (!active) return
        setEmail(null)
      })
    return () => {
      active = false
    }
  }, [])

  return email
}

const STATUS_STAMP_CLASS: Record<QuoteStatus, string> = {
  draft: "border-neutral-300 text-neutral-500",
  sent: "border-sky-300 text-sky-700",
  accepted: "border-emerald-300 text-emerald-700",
  declined: "border-red-300 text-red-700",
  paid: "border-emerald-400 text-emerald-800",
}

export function StatusStamp({ status, className }: { status: QuoteStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]",
        STATUS_STAMP_CLASS[status],
        className
      )}
    >
      {statusLabel(status)}
    </span>
  )
}

/** White paper sheet. Clean on screen, clean on paper. */
export function DocumentSheet({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "quotes-sheet mx-auto w-full max-w-[780px] bg-white p-6 text-neutral-900 shadow-lg ring-1 ring-black/10 sm:p-10",
        className
      )}
    >
      {children}
    </div>
  )
}

export function DocumentHeader({
  kind,
  number,
  status,
  issuerEmail,
}: {
  kind: string
  number: string
  status: QuoteStatus
  issuerEmail: string | null
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-200 pb-5">
      <div className="min-w-0">
        <p className="text-sm font-semibold tracking-tight text-neutral-900">Minimalist Toolkit</p>
        {issuerEmail ? (
          <p className="mt-0.5 truncate text-xs text-neutral-500">{issuerEmail}</p>
        ) : null}
      </div>
      <div className="text-right">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
          {kind}
        </p>
        <p className="mt-1 text-lg font-semibold tabular-nums tracking-tight text-neutral-900">
          {number}
        </p>
        <StatusStamp status={status} className="mt-2" />
      </div>
    </header>
  )
}

export function DocumentClientBlock({ quote }: { quote: QuoteDocument }) {
  const { name, company, email, address } = quote.client
  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-2">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Bill to
        </p>
        <p className="mt-2 text-sm font-medium text-neutral-900">{name || "Client name"}</p>
        {company ? <p className="text-sm text-neutral-600">{company}</p> : null}
        {address ? (
          <p className="mt-1 whitespace-pre-line text-sm text-neutral-600">{address}</p>
        ) : null}
        {email ? <p className="mt-1 text-sm text-neutral-600">{email}</p> : null}
      </div>
      <div className="sm:text-right">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Details
        </p>
        <dl className="mt-2 space-y-1 text-sm text-neutral-600">
          <div className="flex gap-2 sm:justify-end">
            <dt className="text-neutral-500">Issued</dt>
            <dd className="tabular-nums text-neutral-900">{formatDate(quote.issuedOn)}</dd>
          </div>
          {quote.kind === "quote" && quote.expiresOn ? (
            <div className="flex gap-2 sm:justify-end">
              <dt className="text-neutral-500">Valid until</dt>
              <dd className="tabular-nums text-neutral-900">{formatDate(quote.expiresOn)}</dd>
            </div>
          ) : null}
          <div className="flex gap-2 sm:justify-end">
            <dt className="text-neutral-500">Terms</dt>
            <dd className="text-neutral-900">{termsLabel(quote.terms)}</dd>
          </div>
          <div className="flex gap-2 sm:justify-end">
            <dt className="text-neutral-500">Currency</dt>
            <dd className="text-neutral-900">{quote.currency}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

export function DocumentItemsTable({ quote }: { quote: QuoteDocument }) {
  return (
    <table className="mt-6 w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-neutral-200 text-left text-[11px] uppercase tracking-[0.14em] text-neutral-500">
          <th scope="col" className="py-2 pr-3 font-medium">
            Description
          </th>
          <th scope="col" className="py-2 text-right font-medium">
            Qty
          </th>
          <th scope="col" className="py-2 text-right font-medium">
            Rate
          </th>
          <th scope="col" className="py-2 pl-3 text-right font-medium">
            Amount
          </th>
        </tr>
      </thead>
      <tbody>
        {quote.items.length === 0 ? (
          <tr>
            <td colSpan={4} className="py-4 text-sm text-neutral-500">
              No line items on this document.
            </td>
          </tr>
        ) : (
          quote.items.map((item) => (
            <tr key={item.id} className="border-b border-neutral-100 align-top">
              <td className="py-2.5 pr-3 text-neutral-900">
                {item.description || <span className="text-neutral-400">Line item</span>}
              </td>
              <td className="py-2.5 text-right tabular-nums text-neutral-600">
                {formatQuantity(item.quantity)}
              </td>
              <td className="py-2.5 text-right tabular-nums text-neutral-600">
                {formatMoney(item.rate, quote.currency)}
              </td>
              <td className="py-2.5 pl-3 text-right tabular-nums text-neutral-900">
                {formatMoney(Math.max(0, item.quantity) * Math.max(0, item.rate), quote.currency)}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}

export function DocumentTotals({ quote }: { quote: QuoteDocument }) {
  const totals = documentTotals(quote)
  const money = (value: number) => formatMoney(value, quote.currency)

  return (
    <div className="mt-5 ml-auto w-full max-w-xs space-y-1.5 text-sm">
      <div className="flex justify-between gap-4 text-neutral-600">
        <span>Subtotal</span>
        <span className="tabular-nums">{money(totals.subtotal)}</span>
      </div>
      {totals.discount > 0 ? (
        <div className="flex justify-between gap-4 text-neutral-600">
          <span>Discount</span>
          <span className="tabular-nums">-{money(totals.discount)}</span>
        </div>
      ) : null}
      {totals.tax > 0 ? (
        <div className="flex justify-between gap-4 text-neutral-600">
          <span>
            {quote.taxLabel || "Tax"} ({quote.taxRate}%)
          </span>
          <span className="tabular-nums">{money(totals.tax)}</span>
        </div>
      ) : null}
      <div className="flex justify-between gap-4 border-t border-neutral-200 pt-2 text-base font-semibold text-neutral-900">
        <span>Total</span>
        <span className="tabular-nums">{money(totals.total)}</span>
      </div>
      {totals.deposit > 0 ? (
        <>
          <div className="flex justify-between gap-4 text-neutral-600">
            <span>Deposit ({quote.depositPercent}%)</span>
            <span className="tabular-nums">{money(totals.deposit)}</span>
          </div>
          <div className="flex justify-between gap-4 font-semibold text-neutral-900">
            <span>Balance due</span>
            <span className="tabular-nums">{money(totals.balance)}</span>
          </div>
        </>
      ) : null}
    </div>
  )
}

export function DocumentNotes({ quote }: { quote: QuoteDocument }) {
  if (!quote.notes.trim()) return null
  return (
    <section className="mt-6 border-t border-neutral-200 pt-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
        Notes
      </p>
      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-neutral-700">{quote.notes}</p>
    </section>
  )
}

export function DocumentFooter({ quote }: { quote: QuoteDocument }) {
  return (
    <footer className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200 pt-4 text-[11px] text-neutral-500">
      <span>Generated with Minimalist Toolkit</span>
      {quote.linkedQuoteNumber ? <span>Converted from quote {quote.linkedQuoteNumber}</span> : null}
    </footer>
  )
}

/** Print ready quote document. */
export function QuoteDocumentView({
  quote,
  issuerEmail,
  className,
}: {
  quote: QuoteDocument
  issuerEmail: string | null
  className?: string
}) {
  return (
    <DocumentSheet className={className}>
      <DocumentHeader
        kind="Quote"
        number={quote.number}
        status={quote.status}
        issuerEmail={issuerEmail}
      />
      <DocumentClientBlock quote={quote} />
      <DocumentItemsTable quote={quote} />
      <DocumentTotals quote={quote} />
      <DocumentNotes quote={quote} />
      <DocumentFooter quote={quote} />
    </DocumentSheet>
  )
}
