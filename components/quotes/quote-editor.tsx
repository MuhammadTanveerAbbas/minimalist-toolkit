"use client"

import { useMemo, useState } from "react"
import {
  AlertCircle,
  Copy,
  FileDown,
  FileSpreadsheet,
  Plus,
  Printer,
  Save,
  Trash2,
  Receipt,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { documentTotals, formatMoney, suggestNextNumber } from "@/lib/quotes/calculate"
import { formatDate, todayIso } from "@/lib/quotes/format"
import {
  CURRENCIES,
  PAYMENT_TERM_OPTIONS,
  QUOTE_STATUSES,
  type CurrencyCode,
  type PaymentTerms,
  type QuoteDocument,
  type QuoteKind,
  type QuoteStatus,
} from "@/lib/quotes/types"
import { cn } from "@/lib/utils"

interface ValidationMessages {
  clientName?: string
  items?: string
  lineItems: Record<string, { quantity?: string; rate?: string }>
}

function validateQuote(quote: QuoteDocument): ValidationMessages {
  const lineItems: ValidationMessages["lineItems"] = {}
  for (const item of quote.items) {
    const messages: { quantity?: string; rate?: string } = {}
    if (!Number.isFinite(item.quantity) || item.quantity < 0) {
      messages.quantity = "Quantity must be zero or more."
    }
    if (!Number.isFinite(item.rate) || item.rate < 0) {
      messages.rate = "Rate must be zero or more."
    }
    if (messages.quantity || messages.rate) lineItems[item.id] = messages
  }

  return {
    clientName: quote.client.name.trim() ? undefined : "Client name is required.",
    items: quote.items.some((item) => item.description.trim())
      ? undefined
      : "Add at least one line item with a description.",
    lineItems,
  }
}

function parseNumber(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

export function QuoteEditor({
  document: quote,
  existingNumbers,
  isNew,
  saving,
  error,
  onChange,
  onSave,
  onDuplicate,
  onDelete,
  onConvert,
  onPrint,
  onExportCsv,
  onExportMarkdown,
}: {
  document: QuoteDocument
  existingNumbers: string[]
  isNew: boolean
  saving: boolean
  error: string | null
  onChange: (next: QuoteDocument) => void
  onSave: () => void
  onDuplicate: () => void
  onDelete: () => void
  onConvert: () => void
  onPrint: () => void
  onExportCsv: () => void
  onExportMarkdown: () => void
  /** The rendered document, shown in the preview pane. */
  preview?: React.ReactNode
}) {
  const [showErrors, setShowErrors] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [preview, setPreview] = useState(false)

  const validation = useMemo(() => validateQuote(quote), [quote])
  const totals = useMemo(() => documentTotals(quote), [quote])
  const money = (value: number) => formatMoney(value, quote.currency)

  const update = (patch: Partial<QuoteDocument>) => onChange({ ...quote, ...patch })

  const handleKindChange = (kind: QuoteKind) => {
    if (kind === quote.kind) return
    const generated = /^(Q|INV)-\d{4}-\d+$/.test(quote.number.trim())
    update({
      kind,
      number: generated ? suggestNextNumber(existingNumbers, kind, todayIso()) : quote.number,
      expiresOn: kind === "invoice" ? "" : quote.expiresOn || todayIso(),
    })
  }

  const handleSave = () => {
    setShowErrors(true)
    if (validation.clientName || validation.items || Object.keys(validation.lineItems).length > 0) return
    onSave()
  }

  const updateItem = (id: string, patch: Partial<QuoteDocument["items"][number]>) => {
    update({
      items: quote.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    })
  }

  const addItem = () => {
    update({
      items: [
        ...quote.items,
        { id: crypto.randomUUID(), description: "", quantity: 1, rate: 0 },
      ],
    })
  }

  const removeItem = (id: string) => {
    update({ items: quote.items.filter((item) => item.id !== id) })
  }

  const netAfterDiscount = Math.max(0, totals.subtotal - totals.discount)
  const taxShare = totals.total > 0 ? (totals.tax / totals.total) * 100 : 0
  const depositShare = totals.total > 0 ? (totals.deposit / totals.total) * 100 : 0

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <div
          className="flex rounded-lg border border-border bg-muted/30 p-0.5"
          role="group"
          aria-label="Document type"
        >
          {(["quote", "invoice"] as QuoteKind[]).map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => handleKindChange(kind)}
              aria-pressed={quote.kind === kind}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors duration-150",
                quote.kind === kind
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {kind === "quote" ? (
                <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Receipt className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {kind === "quote" ? "Quote" : "Invoice"}
            </button>
          ))}
        </div>

        <Button size="sm" variant="ghost" onClick={() => setPreview((value) => !value)}>
          {preview ? "Hide preview" : "Preview"}
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={onPrint} className="gap-1.5">
            <Printer className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Print / PDF</span>
            <span className="sm:hidden">Print</span>
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
            <Save className="h-3.5 w-3.5" aria-hidden="true" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="flex items-start gap-2 border-b border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {preview ? (
          <div className="bg-surface-2 p-4 sm:p-6">
            <p className="mx-auto mb-3 max-w-[780px] text-xs text-muted-foreground">
              This is exactly what prints. Use the Print button to save it as a PDF.
            </p>
            <div data-quotes-preview>{preview}</div>
          </div>
        ) : (
          <div className="space-y-5 p-4 sm:p-5">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Field label="Number" htmlFor="quote-number">
                <Input
                  id="quote-number"
                  value={quote.number}
                  onChange={(event) => update({ number: event.target.value })}
                  className="tabular-nums"
                />
              </Field>

              <Field label="Status" htmlFor="quote-status">
                <Select
                  value={quote.status}
                  onValueChange={(value) => update({ status: value as QuoteStatus })}
                >
                  <SelectTrigger id="quote-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUOTE_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Issue date" htmlFor="quote-issued">
                <Input
                  id="quote-issued"
                  type="date"
                  value={quote.issuedOn}
                  onChange={(event) => update({ issuedOn: event.target.value })}
                />
              </Field>

              {quote.kind === "quote" ? (
                <Field label="Valid until" htmlFor="quote-expires">
                  <Input
                    id="quote-expires"
                    type="date"
                    value={quote.expiresOn}
                    onChange={(event) => update({ expiresOn: event.target.value })}
                  />
                </Field>
              ) : null}

              <Field label="Currency" htmlFor="quote-currency">
                <Select
                  value={quote.currency}
                  onValueChange={(value) => update({ currency: value as CurrencyCode })}
                >
                  <SelectTrigger id="quote-currency" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Payment terms" htmlFor="quote-terms" hint={`Due ${formatDate(totals.dueDate)}`}>
                <Select
                  value={String(quote.terms)}
                  onValueChange={(value) =>
                    update({ terms: Number(value) as PaymentTerms })
                  }
                >
                  <SelectTrigger id="quote-terms" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_TERM_OPTIONS.map((terms) => (
                      <SelectItem key={terms} value={String(terms)}>
                        Net {terms}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </section>

            <section className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold">Client</h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <Field label="Name" htmlFor="client-name" error={showErrors ? validation.clientName : undefined}>
                  <Input
                    id="client-name"
                    value={quote.client.name}
                    onChange={(event) =>
                      update({ client: { ...quote.client, name: event.target.value } })
                    }
                    aria-invalid={showErrors && validation.clientName ? true : undefined}
                  />
                </Field>
                <Field label="Company" htmlFor="client-company">
                  <Input
                    id="client-company"
                    value={quote.client.company}
                    onChange={(event) =>
                      update({ client: { ...quote.client, company: event.target.value } })
                    }
                  />
                </Field>
                <Field label="Email" htmlFor="client-email">
                  <Input
                    id="client-email"
                    type="email"
                    value={quote.client.email}
                    onChange={(event) =>
                      update({ client: { ...quote.client, email: event.target.value } })
                    }
                  />
                </Field>
                <Field label="Address" htmlFor="client-address">
                  <Textarea
                    id="client-address"
                    rows={2}
                    value={quote.client.address}
                    onChange={(event) =>
                      update({ client: { ...quote.client, address: event.target.value } })
                    }
                    className="min-h-16 resize-y"
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold">Line items</h3>
                <Button size="sm" variant="ghost" onClick={addItem} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  Add line item
                </Button>
              </div>

              {showErrors && validation.items ? (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  {validation.items}
                </p>
              ) : null}

              <ul className="mt-3 space-y-3">
                {quote.items.length === 0 ? (
                  <li className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                    No line items yet. Add one to describe what the client is paying for.
                  </li>
                ) : null}

                {quote.items.map((item) => {
                  const itemErrors = validation.lineItems[item.id]
                  return (
                    <li
                      key={item.id}
                      className="grid grid-cols-1 gap-2 rounded-lg border border-border p-3 sm:grid-cols-12 sm:items-start sm:gap-2"
                    >
                      <div className="sm:col-span-5">
                        <Label
                          htmlFor={`item-description-${item.id}`}
                          className="text-xs text-muted-foreground"
                        >
                          Description
                        </Label>
                        <Input
                          id={`item-description-${item.id}`}
                          defaultValue={item.description}
                          key={`${item.id}-description-${item.description}`}
                          onChange={(event) =>
                            updateItem(item.id, { description: event.target.value })
                          }
                          placeholder="Design sprint, 20 hours"
                          className="mt-1"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <Label
                          htmlFor={`item-quantity-${item.id}`}
                          className="text-xs text-muted-foreground"
                        >
                          Quantity
                        </Label>
                        <Input
                          id={`item-quantity-${item.id}`}
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step="any"
                          className="numeric-input mt-1"
                          defaultValue={String(item.quantity)}
                          key={`${item.id}-quantity-${item.quantity}`}
                          onChange={(event) => {
                            const parsed = parseNumber(event.target.value)
                            if (parsed !== null) updateItem(item.id, { quantity: parsed })
                          }}
                          aria-invalid={itemErrors?.quantity ? true : undefined}
                        />
                        {itemErrors?.quantity ? (
                          <p className="mt-1 text-[11px] text-destructive">{itemErrors.quantity}</p>
                        ) : null}
                      </div>

                      <div className="sm:col-span-2">
                        <Label htmlFor={`item-rate-${item.id}`} className="text-xs text-muted-foreground">
                          Rate
                        </Label>
                        <Input
                          id={`item-rate-${item.id}`}
                          type="number"
                          inputMode="decimal"
                          min={0}
                          step="any"
                          className="numeric-input mt-1"
                          defaultValue={String(item.rate)}
                          key={`${item.id}-rate-${item.rate}`}
                          onChange={(event) => {
                            const parsed = parseNumber(event.target.value)
                            if (parsed !== null) updateItem(item.id, { rate: parsed })
                          }}
                          aria-invalid={itemErrors?.rate ? true : undefined}
                        />
                        {itemErrors?.rate ? (
                          <p className="mt-1 text-[11px] text-destructive">{itemErrors.rate}</p>
                        ) : null}
                      </div>

                      <div className="sm:col-span-2">
                        <span className="text-xs text-muted-foreground">Amount</span>
                        <p className="mt-1 text-sm font-medium tabular-nums sm:pt-2">
                          {money(Math.max(0, item.quantity) * Math.max(0, item.rate))}
                        </p>
                      </div>

                      <div className="flex justify-end sm:col-span-1 sm:pt-6">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove line item ${item.description || "without description"}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </li>
                  )
                })}
              </ul>

              <div className="mt-3 flex justify-end border-t border-border pt-3 text-sm font-medium tabular-nums">
                Subtotal {money(totals.subtotal)}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold">Money</h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Field label="Tax label" htmlFor="tax-label">
                  <Input
                    id="tax-label"
                    defaultValue={quote.taxLabel}
                    key={`${quote.id}-tax-label-${quote.taxLabel}`}
                    onChange={(event) => update({ taxLabel: event.target.value })}
                    placeholder="VAT"
                  />
                </Field>

                <Field label="Tax rate (%)" htmlFor="tax-rate">
                  <Input
                    id="tax-rate"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={100}
                    step="any"
                    className="numeric-input"
                    defaultValue={String(quote.taxRate)}
                    key={`${quote.id}-tax-rate-${quote.taxRate}`}
                    onChange={(event) => {
                      const parsed = parseNumber(event.target.value)
                      if (parsed !== null) update({ taxRate: parsed })
                    }}
                  />
                </Field>

                <Field label="Discount" htmlFor="discount-type">
                  <div className="flex gap-2">
                    <Select
                      value={quote.discountType}
                      onValueChange={(value) =>
                        update({ discountType: value as "percent" | "fixed" })
                      }
                    >
                      <SelectTrigger id="discount-type" className="w-28 shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">Percent</SelectItem>
                        <SelectItem value="fixed">Fixed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="any"
                      aria-label="Discount value"
                      className="numeric-input"
                      defaultValue={String(quote.discountValue)}
                      key={`${quote.id}-discount-value-${quote.discountValue}`}
                      onChange={(event) => {
                        const parsed = parseNumber(event.target.value)
                        if (parsed !== null) update({ discountValue: parsed })
                      }}
                    />
                  </div>
                </Field>

                <Field label="Deposit (%)" htmlFor="deposit-percent">
                  <Input
                    id="deposit-percent"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={100}
                    step="any"
                    className="numeric-input"
                    defaultValue={String(quote.depositPercent)}
                    key={`${quote.id}-deposit-${quote.depositPercent}`}
                    onChange={(event) => {
                      const parsed = parseNumber(event.target.value)
                      if (parsed !== null) update({ depositPercent: parsed })
                    }}
                  />
                </Field>
              </div>

              <div className="mt-4 rounded-lg border border-border bg-surface-2 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Money summary
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    Due {formatDate(totals.dueDate)}
                  </span>
                </div>

                <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                  <Row label="Subtotal" value={money(totals.subtotal)} />
                  <Row
                    label="Discount"
                    value={totals.discount > 0 ? `-${money(totals.discount)}` : money(0)}
                  />
                  <Row
                    label={`${quote.taxLabel || "Tax"} (${quote.taxRate}%)`}
                    value={money(totals.tax)}
                  />
                  <Row label="Total" value={money(totals.total)} emphasis />
                  <Row
                    label={`Deposit (${quote.depositPercent}%)`}
                    value={money(totals.deposit)}
                  />
                  <Row label="Balance due" value={money(totals.balance)} emphasis />
                </dl>

                <div className="mt-4 space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Total breakdown</span>
                      <span className="tabular-nums">{money(totals.total)}</span>
                    </div>
                    <div
                      className="mt-1 flex h-2.5 w-full overflow-hidden rounded-full bg-muted"
                      role="img"
                      aria-label={`Total ${money(totals.total)}: ${money(netAfterDiscount)} net of discount and ${money(totals.tax)} tax`}
                    >
                      <span
                        className="h-full bg-chart-4"
                        style={{ width: `${100 - taxShare}%` }}
                      />
                      <span className="h-full bg-chart-2" style={{ width: `${taxShare}%` }} />
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                      <Legend color="var(--chart-4)" label={`Net ${money(netAfterDiscount)}`} />
                      <Legend color="var(--chart-2)" label={`${quote.taxLabel || "Tax"} ${money(totals.tax)}`} />
                    </div>
                  </div>

                  {totals.deposit > 0 ? (
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Payment split</span>
                        <span className="tabular-nums">{money(totals.total)}</span>
                      </div>
                      <div
                        className="mt-1 flex h-2.5 w-full overflow-hidden rounded-full bg-muted"
                        role="img"
                        aria-label={`Deposit ${money(totals.deposit)} due now, balance ${money(totals.balance)}`}
                      >
                        <span
                          className="h-full bg-chart-1"
                          style={{ width: `${depositShare}%` }}
                        />
                        <span
                          className="h-full bg-chart-3"
                          style={{ width: `${100 - depositShare}%` }}
                        />
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                        <Legend color="var(--chart-1)" label={`Deposit ${money(totals.deposit)}`} />
                        <Legend color="var(--chart-3)" label={`Balance ${money(totals.balance)}`} />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold">Notes</h3>
              <Textarea
                id="quote-notes"
                rows={4}
                value={quote.notes}
                onChange={(event) => update({ notes: event.target.value })}
                placeholder="Payment instructions, what is included, what happens next."
                className="mt-3 resize-y"
                aria-label="Notes"
              />
            </section>

            <section className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold">Actions</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={onDuplicate} className="gap-1.5">
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  Duplicate
                </Button>
                {quote.kind === "quote" ? (
                  <Button size="sm" variant="outline" onClick={onConvert} className="gap-1.5">
                    <Receipt className="h-3.5 w-3.5" aria-hidden="true" />
                    Convert to invoice
                  </Button>
                ) : null}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onExportCsv}
                  className="gap-1.5"
                  disabled={isNew}
                >
                  <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
                  Export CSV
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onExportMarkdown}
                  className="gap-1.5"
                  disabled={isNew}
                >
                  <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
                  Export Markdown
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeleteOpen(true)}
                  className="gap-1.5 text-destructive hover:text-destructive"
                  disabled={isNew}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Delete
                </Button>
              </div>
              {isNew ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Save this document before exporting or deleting it.
                </p>
              ) : null}
            </section>
          </div>
        )}
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {quote.kind === "invoice" ? "invoice" : "quote"}</AlertDialogTitle>
            <AlertDialogDescription>
              {quote.number} for {quote.client.name || "this client"} will be permanently removed. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDeleteOpen(false)
                onDelete()
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p className="mt-1 text-[11px] text-destructive">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

function Row({
  label,
  value,
  emphasis,
}: {
  label: string
  value: string
  emphasis?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={emphasis ? "font-semibold" : "text-muted-foreground"}>{label}</dt>
      <dd className={cn("tabular-nums", emphasis && "font-semibold")}>{value}</dd>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}
