"use client"

import { useCallback, useMemo, useState } from "react"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToolDocuments } from "@/lib/persistence/use-tool-documents"
import {
  documentTotals,
  formatMoney,
  isOverdue,
  suggestNextNumber,
} from "@/lib/quotes/calculate"
import { todayIso } from "@/lib/quotes/format"
import { downloadFile, documentFileName, toCsv, toMarkdown } from "@/lib/quotes/export"
import {
  DEFAULT_CURRENCY,
  DEFAULT_TAX_LABEL,
  DEFAULT_TERMS,
  quoteDocumentTitle,
  toQuoteDocument,
  type CurrencyCode,
  type QuoteDocument,
  type QuoteDocumentPayload,
  type QuoteEntry,
  type QuoteKind,
} from "@/lib/quotes/types"
import { QuoteEditor } from "./quote-editor"
import { QuoteList } from "./quote-list"
import { QuotesSummary } from "./quotes-summary"
import { QuoteDocumentView, useIssuerEmail } from "./quote-document"
import { InvoiceDocumentView } from "./invoice-document"

/**
 * Print stylesheet. The document is rendered in a hidden container that only
 * becomes visible when the browser prints, so nothing else on the page ends
 * up on paper.
 */
const PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  #quotes-print-root, #quotes-print-root * { visibility: visible !important; }
  #quotes-print-root {
    display: block !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
  }
  #quotes-print-root .quotes-sheet {
    box-shadow: none !important;
    border: 0 !important;
    max-width: none !important;
    padding: 0 !important;
    background: #ffffff !important;
  }
}
`

const NEW_KEY = "__new__"

function emptyDocument(kind: QuoteKind, existingNumbers: string[]): QuoteDocument {
  const today = todayIso()
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    kind,
    number: suggestNextNumber(existingNumbers, kind, today),
    status: "draft",
    client: { name: "", company: "", email: "", address: "" },
    items: [{ id: crypto.randomUUID(), description: "", quantity: 1, rate: 0 }],
    currency: DEFAULT_CURRENCY,
    taxLabel: DEFAULT_TAX_LABEL,
    taxRate: 0,
    discountType: "percent",
    discountValue: 0,
    depositPercent: 0,
    terms: DEFAULT_TERMS,
    issuedOn: today,
    expiresOn: kind === "quote" ? today : "",
    notes: "",
    linkedQuoteNumber: null,
    createdAt: now,
    updatedAt: now,
  }
}

/** The hook owns the row id, title and timestamps, so only the rest is stored. */
function toPayload(quote: QuoteDocument): QuoteDocumentPayload {
  return {
    id: quote.id,
    kind: quote.kind,
    number: quote.number,
    status: quote.status,
    client: quote.client,
    items: quote.items,
    currency: quote.currency,
    taxLabel: quote.taxLabel,
    taxRate: quote.taxRate,
    discountType: quote.discountType,
    discountValue: quote.discountValue,
    depositPercent: quote.depositPercent,
    terms: quote.terms,
    issuedOn: quote.issuedOn,
    expiresOn: quote.expiresOn,
    notes: quote.notes,
    linkedQuoteNumber: quote.linkedQuoteNumber,
  }
}

export function QuotesTool() {
  const { documents, mode, error: storageError, create, update, remove, setError } =
    useToolDocuments<QuoteDocumentPayload>("quotes")

  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, QuoteDocument>>({})
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const issuerEmail = useIssuerEmail()

  const entries: QuoteEntry[] = useMemo(
    () =>
      documents.map((doc) => ({
        rowId: doc.id,
        document: toQuoteDocument({ data: doc.data, createdAt: doc.createdAt, updatedAt: doc.updatedAt }),
      })),
    [documents]
  )

  const existingNumbers = useMemo(() => entries.map((entry) => entry.document.number), [entries])

  const savedDocument = activeKey
    ? entries.find((entry) => entry.rowId === activeKey)?.document ?? null
    : null
  const activeDocument = activeKey ? drafts[activeKey] ?? savedDocument : null
  const isNew = activeKey === NEW_KEY

  const handleChange = useCallback(
    (next: QuoteDocument) => {
      if (!activeKey) return
      setDrafts((previous) => ({ ...previous, [activeKey]: next }))
    },
    [activeKey]
  )

  const handleSelect = useCallback((entry: QuoteEntry) => {
    setActiveKey(entry.rowId)
    setActionError(null)
  }, [])

  const handleCreate = useCallback(
    (kind: QuoteKind) => {
      const draft = emptyDocument(kind, existingNumbers)
      setDrafts((previous) => ({ ...previous, [NEW_KEY]: draft }))
      setActiveKey(NEW_KEY)
      setActionError(null)
    },
    [existingNumbers]
  )

  const handleSave = useCallback(async () => {
    if (!activeDocument) return
    setSaving(true)
    setActionError(null)
    try {
      const payload = toPayload(activeDocument)
      const title = quoteDocumentTitle(activeDocument)
      if (activeKey && activeKey !== NEW_KEY) {
        await update(activeKey, { title, data: payload })
      } else {
        const saved = await create(title, payload)
        setDrafts((previous) => {
          const next = { ...previous }
          delete next[NEW_KEY]
          // The quote keeps its own id, which is what the payload stores. The
          // row id is only the key this draft is filed under.
          next[saved.id] = {
            ...activeDocument,
            createdAt: saved.createdAt,
            updatedAt: saved.updatedAt,
          }
          return next
        })
        setActiveKey(saved.id)
      }
    } catch (caught) {
      setActionError(
        caught instanceof Error ? caught.message : "Could not save this document. Try again."
      )
    } finally {
      setSaving(false)
    }
  }, [activeDocument, activeKey, create, update])

  const handleDuplicate = useCallback(async () => {
    if (!activeDocument) return
    setSaving(true)
    setActionError(null)
    try {
      const copy: QuoteDocument = {
        ...activeDocument,
        id: crypto.randomUUID(),
        number: suggestNextNumber(existingNumbers, activeDocument.kind, todayIso()),
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const saved = await create(quoteDocumentTitle(copy), toPayload(copy))
      setDrafts((previous) => ({
        ...previous,
        [saved.id]: { ...copy, createdAt: saved.createdAt, updatedAt: saved.updatedAt },
      }))
      setActiveKey(saved.id)
    } catch (caught) {
      setActionError(
        caught instanceof Error ? caught.message : "Could not duplicate this document. Try again."
      )
    } finally {
      setSaving(false)
    }
  }, [activeDocument, create, existingNumbers])

  const handleConvert = useCallback(async () => {
    if (!activeDocument) return
    setSaving(true)
    setActionError(null)
    try {
      const now = new Date().toISOString()
      const invoice: QuoteDocument = {
        ...activeDocument,
        id: crypto.randomUUID(),
        kind: "invoice",
        number: suggestNextNumber(existingNumbers, "invoice", todayIso()),
        status: "draft",
        issuedOn: todayIso(),
        expiresOn: "",
        linkedQuoteNumber: activeDocument.number,
        createdAt: now,
        updatedAt: now,
      }
      const saved = await create(quoteDocumentTitle(invoice), toPayload(invoice))
      setDrafts((previous) => ({
        ...previous,
        [saved.id]: { ...invoice, createdAt: saved.createdAt, updatedAt: saved.updatedAt },
      }))
      setActiveKey(saved.id)
    } catch (caught) {
      setActionError(
        caught instanceof Error ? caught.message : "Could not create the invoice. Try again."
      )
    } finally {
      setSaving(false)
    }
  }, [activeDocument, create, existingNumbers])

  const handleDelete = useCallback(async () => {
    if (!activeKey || activeKey === NEW_KEY) return
    const rowId = activeKey
    setSaving(true)
    setActionError(null)
    try {
      await remove(rowId)
      setDrafts((previous) => {
        const next = { ...previous }
        delete next[rowId]
        return next
      })
      setActiveKey(null)
    } catch (caught) {
      setActionError(
        caught instanceof Error ? caught.message : "Could not delete this document. Try again."
      )
    } finally {
      setSaving(false)
    }
  }, [activeKey, remove])

  const handlePrint = useCallback(() => {
    if (typeof window === "undefined") return
    window.print()
  }, [])

  const handleExportCsv = useCallback(() => {
    if (!activeDocument) return
    downloadFile(documentFileName(activeDocument, "csv"), toCsv(activeDocument), "text/csv")
  }, [activeDocument])

  const handleExportMarkdown = useCallback(() => {
    if (!activeDocument) return
    downloadFile(
      documentFileName(activeDocument, "md"),
      toMarkdown(activeDocument),
      "text/markdown"
    )
  }, [activeDocument])

  const savedDocuments = useMemo(() => entries.map((entry) => entry.document), [entries])

  // Amounts are grouped by currency. Summing across currencies would produce
  // a meaningless number, so each currency is reported on its own line.
  const outstandingByCurrency = useMemo(() => {
    const totals = new Map<string, number>()
    for (const doc of savedDocuments) {
      if (doc.kind !== "invoice" || doc.status === "paid") continue
      const balance = documentTotals(doc).balance
      totals.set(doc.currency, (totals.get(doc.currency) ?? 0) + balance)
    }
    return [...totals.entries()].filter(([, amount]) => amount > 0)
  }, [savedDocuments])

  const overdueCount = useMemo(
    () =>
      savedDocuments.filter((doc) => {
        if (doc.kind !== "invoice") return false
        return isOverdue(documentTotals(doc).dueDate, doc.status)
      }).length,
    [savedDocuments]
  )

  const printDocument = activeDocument

  return (
    <div className="space-y-4">
      <style>{PRINT_CSS}</style>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <aside className="order-1 lg:col-start-1 lg:row-start-1">
          <div className="flex h-[70dvh] max-h-[520px] flex-col overflow-hidden rounded-xl border border-border bg-card lg:h-[calc(100dvh-11rem)] lg:max-h-[900px]">
            <QuoteList
              entries={entries}
              loading={mode === "loading"}
              activeRowId={activeKey && activeKey !== NEW_KEY ? activeKey : null}
              onSelect={handleSelect}
              onCreate={handleCreate}
            />
          </div>
        </aside>

        <section className="order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2">
          {activeDocument ? (
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <QuoteEditor
                key={activeDocument.id}
                document={activeDocument}
                existingNumbers={existingNumbers}
                isNew={isNew}
                saving={saving}
                error={actionError ?? storageError}
                onChange={handleChange}
                onSave={handleSave}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                onConvert={handleConvert}
                onPrint={handlePrint}
                onExportCsv={handleExportCsv}
                onExportMarkdown={handleExportMarkdown}
                preview={
                  activeDocument.kind === "invoice" ? (
                    <InvoiceDocumentView quote={activeDocument} issuerEmail={issuerEmail} />
                  ) : (
                    <QuoteDocumentView quote={activeDocument} issuerEmail={issuerEmail} />
                  )
                }
              />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-surface-2 p-10 text-center">
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card">
                <FileText className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-base font-semibold">Nothing open</h2>
              <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-muted-foreground">
                Pick a quote or invoice from the list, or start a new quote. Everything you save stays
                in your account.
              </p>
              <Button onClick={() => handleCreate("quote")} className="mt-4">
                Create your first quote
              </Button>
            </div>
          )}
        </section>

        <div className="order-3 lg:col-start-1 lg:row-start-2">
          <QuotesSummary documents={savedDocuments} />
          {outstandingByCurrency.length > 0 ? (
            <p className="mt-3 text-xs text-muted-foreground">
              {outstandingByCurrency
                .map(
                  ([currency, amount]) =>
                    `${formatMoney(amount, currency as CurrencyCode)} outstanding`
                )
                .join(", ")}{" "}
              across your saved invoices
              {overdueCount > 0
                ? `, ${overdueCount} of them overdue.`
                : "."}
            </p>
          ) : null}
        </div>
      </div>

      {printDocument ? (
        <div id="quotes-print-root" className="hidden" aria-hidden="true">
          {printDocument.kind === "invoice" ? (
            <InvoiceDocumentView quote={printDocument} issuerEmail={issuerEmail} />
          ) : (
            <QuoteDocumentView quote={printDocument} issuerEmail={issuerEmail} />
          )}
        </div>
      ) : null}
    </div>
  )
}
