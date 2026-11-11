import type {
  CurrencyCode,
  DiscountType,
  PaymentTerms,
  QuoteDocument,
  QuoteLineItem,
  QuoteStatus,
} from "./types"

/**
 * Pure, deterministic money maths for the Quotes tool.
 *
 * Every function is defensive about the input: negative quantities and rates
 * are clamped to zero, percentages are clamped to their valid range and
 * unparsable dates are returned untouched rather than producing "Invalid
 * Date" strings.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

/** Money is rounded to two decimals so totals never show float noise. */
export function roundMoney(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function lineTotal(item: QuoteLineItem): number {
  if (!item) return 0
  const quantity = clamp(Number(item.quantity) || 0, 0, Number.MAX_SAFE_INTEGER)
  const rate = clamp(Number(item.rate) || 0, 0, Number.MAX_SAFE_INTEGER)
  return roundMoney(quantity * rate)
}

export function subtotal(items: QuoteLineItem[]): number {
  if (!Array.isArray(items) || items.length === 0) return 0
  const sum = items.reduce((total, item) => total + lineTotal(item), 0)
  return roundMoney(sum)
}

/**
 * Discount applied to the subtotal. A percentage can never take the subtotal
 * below zero, and a fixed amount is clamped to the subtotal.
 */
export function discountAmount(
  subtotalValue: number,
  discountType: DiscountType,
  discountValue: number
): number {
  const base = clamp(Number(subtotalValue) || 0, 0, Number.MAX_SAFE_INTEGER)
  if (base === 0) return 0
  const value = clamp(Number(discountValue) || 0, 0, Number.MAX_SAFE_INTEGER)

  if (discountType === "percent") {
    const percent = clamp(value, 0, 100)
    return roundMoney(Math.min(base, (base * percent) / 100))
  }

  return roundMoney(Math.min(base, value))
}

/** Tax charged on the discounted subtotal. */
export function taxAmount(taxableBase: number, taxRate: number): number {
  const base = clamp(Number(taxableBase) || 0, 0, Number.MAX_SAFE_INTEGER)
  const rate = clamp(Number(taxRate) || 0, 0, 100)
  return roundMoney((base * rate) / 100)
}

export function total(subtotalValue: number, discount: number, tax: number): number {
  const base = clamp(Number(subtotalValue) || 0, 0, Number.MAX_SAFE_INTEGER)
  const discountValue = clamp(Number(discount) || 0, 0, base)
  const taxValue = clamp(Number(tax) || 0, 0, Number.MAX_SAFE_INTEGER)
  return roundMoney(base - discountValue + taxValue)
}

/** Deposit taken up front, as a percentage of the total. */
export function depositAmount(totalValue: number, depositPercent: number): number {
  const base = clamp(Number(totalValue) || 0, 0, Number.MAX_SAFE_INTEGER)
  const percent = clamp(Number(depositPercent) || 0, 0, 100)
  return roundMoney((base * percent) / 100)
}

/** What is still owed once the deposit has been taken. */
export function balanceDue(totalValue: number, depositValue: number): number {
  const base = clamp(Number(totalValue) || 0, 0, Number.MAX_SAFE_INTEGER)
  const deposit = clamp(Number(depositValue) || 0, 0, base)
  return roundMoney(base - deposit)
}

/** Parses a YYYY-MM-DD string as a UTC date. Returns null when unusable. */
function parseIsoDate(value: string): Date | null {
  if (typeof value !== "string") return null
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim())
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null
  const date = new Date(Date.UTC(year, month - 1, day))
  if (Number.isNaN(date.getTime())) return null
  return date
}

/** Formats a UTC date back to YYYY-MM-DD. */
function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/**
 * Payment due date: the issue date plus the agreed terms. An unparsable
 * issue date is returned unchanged.
 */
export function dueDate(issuedOn: string, terms: PaymentTerms): string {
  const date = parseIsoDate(issuedOn)
  if (!date) return issuedOn
  const days = clamp(Number(terms) || 0, 0, 365)
  return toIsoDate(new Date(date.getTime() + days * MS_PER_DAY))
}

/** True when the due date has passed and the document is still unpaid. */
export function isOverdue(due: string, status: QuoteStatus): boolean {
  if (status === "paid" || status === "declined") return false
  const date = parseIsoDate(due)
  if (!date) return false
  const today = new Date()
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  return date.getTime() < todayUtc
}

/**
 * Formats an amount in the given currency using Intl.
 *
 * The locale is pinned so server rendered output and the browser agree.
 */
export function formatMoney(amount: number, currency: CurrencyCode): string {
  const value = Number.isFinite(amount) ? amount : 0
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return `${currency} ${value.toFixed(2)}`
  }
}

/** Full money breakdown for a document, in document order. */
export interface QuoteTotals {
  subtotal: number
  discount: number
  tax: number
  total: number
  deposit: number
  balance: number
  dueDate: string
}

export function documentTotals(doc: QuoteDocument): QuoteTotals {
  const subtotalValue = subtotal(doc.items ?? [])
  const discountValue = discountAmount(subtotalValue, doc.discountType, doc.discountValue)
  const taxable = roundMoney(subtotalValue - discountValue)
  const taxValue = taxAmount(taxable, doc.taxRate)
  const totalValue = total(subtotalValue, discountValue, taxValue)
  const depositValue = depositAmount(totalValue, doc.depositPercent)
  return {
    subtotal: subtotalValue,
    discount: discountValue,
    tax: taxValue,
    total: totalValue,
    deposit: depositValue,
    balance: balanceDue(totalValue, depositValue),
    dueDate: dueDate(doc.issuedOn, doc.terms),
  }
}

/**
 * Next sequential document number, for example "Q-2026-0043".
 *
 * Numbers are counted per kind and per year, so quotes and invoices keep
 * separate sequences.
 */
export function suggestNextNumber(
  existingNumbers: string[],
  kind: QuoteDocument["kind"],
  date: string
): string {
  const prefix = kind === "invoice" ? "INV" : "Q"
  const parsed = parseIsoDate(date)
  const year = parsed ? parsed.getUTCFullYear() : new Date().getUTCFullYear()
  const pattern = new RegExp(`^${prefix}-${year}-(\\d+)$`)

  let highest = 0
  if (Array.isArray(existingNumbers)) {
    for (const number of existingNumbers) {
      if (typeof number !== "string") continue
      const match = pattern.exec(number.trim())
      if (!match) continue
      const sequence = Number.parseInt(match[1], 10)
      if (Number.isFinite(sequence) && sequence > highest) highest = sequence
    }
  }

  return `${prefix}-${year}-${String(highest + 1).padStart(4, "0")}`
}
