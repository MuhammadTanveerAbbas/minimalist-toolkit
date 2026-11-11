import type { CurrencyCode, PaymentTerms, QuoteStatus } from "./types"

/**
 * Presentation helpers. These are pure string builders with no React and no
 * DOM access, so they can be used by the editor, the document views and the
 * exporters alike.
 */

export const STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  accepted: "Accepted",
  declined: "Declined",
  paid: "Paid",
}

export function statusLabel(status: QuoteStatus): string {
  return STATUS_LABELS[status] ?? "Draft"
}

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  PKR: "Pakistani Rupee",
  INR: "Indian Rupee",
  CAD: "Canadian Dollar",
  AUD: "Australian Dollar",
}

export function currencyLabel(currency: CurrencyCode): string {
  return CURRENCY_LABELS[currency] ?? currency
}

export function termsLabel(terms: PaymentTerms): string {
  return `Net ${terms}`
}

/**
 * Formats an ISO date as "Mar 12, 2026". Invalid input is returned as text.
 *
 * The locale is fixed so the server and the browser always agree, which
 * keeps server rendered output free of hydration mismatches.
 */
export function formatDate(iso: string): string {
  if (!iso) return ""
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim())
  if (!match) return iso
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

/** Formats a number for display, dropping trailing zeros. */
export function formatQuantity(value: number): string {
  if (!Number.isFinite(value)) return "0"
  return String(Math.round(value * 1000) / 1000)
}

/** Formats a percent value such as 20 or 12.5 as "20%". */
export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "0%"
  const rounded = Math.round(value * 100) / 100
  return `${rounded}%`
}

/** Today as an ISO date in the user's local timezone. */
export function todayIso(): string {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

/** Adds days to an ISO date, returning the input unchanged when invalid. */
export function addDaysIso(iso: string, days: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec((iso ?? "").trim())
  if (!match) return iso
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
  if (Number.isNaN(date.getTime())) return iso
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/** Lowercase, hyphenated slug used in exported file names. */
export function slugify(value: string): string {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}
