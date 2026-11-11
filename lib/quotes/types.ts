/**
 * Data model for the Quotes tool.
 *
 * The persistence hook (`useToolDocuments`) owns the row id, the title and the
 * timestamps. The payload it stores is the quote itself minus the fields the
 * hook already owns. The hook generic requires an `id` on the payload, so the
 * quote keeps its own stable id inside `data` while the hook row id is used
 * for updates and deletes.
 */

export type QuoteStatus = "draft" | "sent" | "accepted" | "declined" | "paid"

export type QuoteKind = "quote" | "invoice"

export type CurrencyCode = "USD" | "EUR" | "GBP" | "PKR" | "INR" | "CAD" | "AUD"

export type PaymentTerms = 7 | 15 | 30

export type DiscountType = "percent" | "fixed"

export interface QuoteLineItem {
  id: string
  description: string
  quantity: number
  rate: number
}

export interface QuoteClient {
  name: string
  company: string
  email: string
  address: string
}

export interface QuoteDocument {
  id: string
  kind: QuoteKind
  number: string
  status: QuoteStatus
  client: QuoteClient
  items: QuoteLineItem[]
  currency: CurrencyCode
  /** Label shown on the document, for example VAT, GST or Sales Tax. */
  taxLabel: string
  /** Percent, 0..100. */
  taxRate: number
  discountType: DiscountType
  discountValue: number
  /** Percentage of the invoice total taken up front, 0..100. */
  depositPercent: number
  terms: PaymentTerms
  /** ISO date, for example 2026-03-01. */
  issuedOn: string
  /** ISO date. Quotes only, optional for invoices. */
  expiresOn: string
  notes: string
  /** Set when an invoice was converted from a quote. */
  linkedQuoteNumber: string | null
  createdAt: string
  updatedAt: string
}

/**
 * What the hook stores. The hook owns `id`, `title`, `createdAt` and
 * `updatedAt` on the row, so the payload only carries the quote fields.
 */
export interface QuoteDocumentPayload
  extends Omit<QuoteDocument, "id" | "createdAt" | "updatedAt"> {
  /** Stable id of the quote itself, used to match a payload to its row. */
  id: string
}

/** A saved quote together with the persistence row it lives in. */
export interface QuoteEntry {
  rowId: string
  document: QuoteDocument
}

export const QUOTE_STATUSES: QuoteStatus[] = [
  "draft",
  "sent",
  "accepted",
  "declined",
  "paid",
]

export const CURRENCIES: CurrencyCode[] = ["USD", "EUR", "GBP", "PKR", "INR", "CAD", "AUD"]

export const PAYMENT_TERM_OPTIONS: PaymentTerms[] = [7, 15, 30]

export const DEFAULT_TAX_LABEL = "Tax"

export const DEFAULT_CURRENCY: CurrencyCode = "USD"

export const DEFAULT_TERMS: PaymentTerms = 30

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback
}

function asNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function asStatus(value: unknown): QuoteStatus {
  return QUOTE_STATUSES.includes(value as QuoteStatus) ? (value as QuoteStatus) : "draft"
}

function asCurrency(value: unknown): CurrencyCode {
  return CURRENCIES.includes(value as CurrencyCode) ? (value as CurrencyCode) : DEFAULT_CURRENCY
}

function asTerms(value: unknown): PaymentTerms {
  return PAYMENT_TERM_OPTIONS.includes(value as PaymentTerms)
    ? (value as PaymentTerms)
    : DEFAULT_TERMS
}

/**
 * Coerces stored data into a well formed payload. Saved rows can come from an
 * older version of the tool or from a partially written local entry, so every
 * field is checked rather than trusted.
 */
export function normalizeQuotePayload(raw: unknown): QuoteDocumentPayload {
  const source = (raw ?? {}) as Record<string, unknown>
  const client = (source.client ?? {}) as Record<string, unknown>
  const items = Array.isArray(source.items) ? source.items : []

  return {
    id: asString(source.id) || crypto.randomUUID(),
    kind: source.kind === "invoice" ? "invoice" : "quote",
    number: asString(source.number),
    status: asStatus(source.status),
    client: {
      name: asString(client.name),
      company: asString(client.company),
      email: asString(client.email),
      address: asString(client.address),
    },
    items: items.map((rawItem) => {
      const item = (rawItem ?? {}) as Record<string, unknown>
      return {
        id: asString(item.id) || crypto.randomUUID(),
        description: asString(item.description),
        quantity: Math.max(0, asNumber(item.quantity)),
        rate: Math.max(0, asNumber(item.rate)),
      }
    }),
    currency: asCurrency(source.currency),
    taxLabel: asString(source.taxLabel, DEFAULT_TAX_LABEL),
    taxRate: Math.min(100, Math.max(0, asNumber(source.taxRate))),
    discountType: source.discountType === "fixed" ? "fixed" : "percent",
    discountValue: Math.max(0, asNumber(source.discountValue)),
    depositPercent: Math.min(100, Math.max(0, asNumber(source.depositPercent))),
    terms: asTerms(source.terms),
    issuedOn: asString(source.issuedOn),
    expiresOn: asString(source.expiresOn),
    notes: asString(source.notes),
    linkedQuoteNumber:
      typeof source.linkedQuoteNumber === "string" ? source.linkedQuoteNumber : null,
  }
}

/**
 * Rebuilds a full quote from a saved row. The row owns the timestamps, the
 * payload owns everything else.
 */
export function toQuoteDocument(row: {
  createdAt: string
  updatedAt: string
  data: unknown
}): QuoteDocument {
  const payload = normalizeQuotePayload(row.data)
  return {
    ...payload,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

/** Title stored alongside the row, used in the document list. */
export function quoteDocumentTitle(quote: QuoteDocument): string {
  const client = quote.client.name.trim() || quote.client.company.trim() || "Untitled client"
  return `${quote.number} - ${client}`
}
