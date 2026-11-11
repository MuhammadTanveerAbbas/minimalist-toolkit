import { documentTotals, formatMoney } from "./calculate"
import { formatDate, formatQuantity, slugify, statusLabel, termsLabel } from "./format"
import type { QuoteDocument } from "./types"

/**
 * Export helpers for the Quotes tool.
 *
 * The CSV is shaped for an accountant: a header block with the document
 * metadata, one row per line item, then the totals. The Markdown is a
 * readable document a client can read in a text editor or paste into an
 * email.
 */

function escapeCsv(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return ""
  const text = String(value)
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function csvRow(values: Array<string | number | undefined | null>): string {
  return values.map(escapeCsv).join(",")
}

function amount(value: number): string {
  return (Math.round((value + Number.EPSILON) * 100) / 100).toFixed(2)
}

/** CSV export: metadata block, line items, then totals. */
export function toCsv(quote: QuoteDocument): string {
  const totals = documentTotals(quote)
  const lines: string[] = []

  lines.push(csvRow(["Document type", quote.kind === "invoice" ? "Invoice" : "Quote"]))
  lines.push(csvRow(["Number", quote.number]))
  lines.push(csvRow(["Status", statusLabel(quote.status)]))
  lines.push(csvRow(["Issue date", quote.issuedOn]))
  if (quote.kind === "quote" && quote.expiresOn) {
    lines.push(csvRow(["Expiry date", quote.expiresOn]))
  }
  lines.push(csvRow(["Payment terms", termsLabel(quote.terms)]))
  lines.push(csvRow(["Due date", totals.dueDate]))
  if (quote.linkedQuoteNumber) {
    lines.push(csvRow(["Converted from quote", quote.linkedQuoteNumber]))
  }
  lines.push(csvRow(["Client", quote.client.name]))
  lines.push(csvRow(["Company", quote.client.company]))
  lines.push(csvRow(["Email", quote.client.email]))
  lines.push(csvRow(["Address", quote.client.address]))
  lines.push(csvRow(["Currency", quote.currency]))
  lines.push(csvRow(["Tax label", quote.taxLabel]))
  lines.push(csvRow(["Tax rate (%)", quote.taxRate]))
  lines.push(csvRow(["Discount type", quote.discountType]))
  lines.push(csvRow(["Discount value", quote.discountValue]))
  lines.push(csvRow(["Deposit (%)", quote.depositPercent]))
  lines.push("")

  lines.push(csvRow(["Description", "Quantity", "Rate", "Amount"]))
  for (const item of quote.items) {
    lines.push(
      csvRow([
        item.description,
        formatQuantity(item.quantity),
        amount(item.rate),
        amount(Math.max(0, item.quantity) * Math.max(0, item.rate)),
      ])
    )
  }

  lines.push("")
  lines.push(csvRow(["Subtotal", "", "", amount(totals.subtotal)]))
  if (totals.discount > 0) {
    lines.push(csvRow([`Discount (${quote.discountType})`, "", "", amount(-totals.discount)]))
  }
  if (totals.tax > 0) {
    lines.push(csvRow([`${quote.taxLabel || "Tax"} (${quote.taxRate}%)`, "", "", amount(totals.tax)]))
  }
  lines.push(csvRow(["Total", "", "", amount(totals.total)]))
  if (totals.deposit > 0) {
    lines.push(csvRow([`Deposit (${quote.depositPercent}%)`, "", "", amount(totals.deposit)]))
    lines.push(csvRow(["Balance due", "", "", amount(totals.balance)]))
  }
  if (quote.notes.trim()) {
    lines.push("")
    lines.push(csvRow(["Notes", quote.notes.trim()]))
  }

  return lines.join("\n")
}

/** Markdown export: a plain text version of the printed document. */
export function toMarkdown(quote: QuoteDocument): string {
  const totals = documentTotals(quote)
  const money = (value: number) => formatMoney(value, quote.currency)
  const lines: string[] = []

  const heading = quote.kind === "invoice" ? "Invoice" : "Quote"
  lines.push(`# ${heading} ${quote.number}`)
  lines.push("")
  lines.push(`- **Status:** ${statusLabel(quote.status)}`)
  lines.push(`- **Issued:** ${formatDate(quote.issuedOn)}`)
  if (quote.kind === "quote" && quote.expiresOn) {
    lines.push(`- **Valid until:** ${formatDate(quote.expiresOn)}`)
  }
  lines.push(`- **Payment terms:** ${termsLabel(quote.terms)} (due ${formatDate(totals.dueDate)})`)
  if (quote.linkedQuoteNumber) {
    lines.push(`- **Converted from quote:** ${quote.linkedQuoteNumber}`)
  }
  lines.push("")

  lines.push("## Bill to")
  lines.push("")
  if (quote.client.name) lines.push(quote.client.name)
  if (quote.client.company) lines.push(quote.client.company)
  if (quote.client.address) lines.push(quote.client.address)
  if (quote.client.email) lines.push(quote.client.email)
  lines.push("")

  lines.push("## Line items")
  lines.push("")
  lines.push("| Description | Qty | Rate | Amount |")
  lines.push("| --- | ---: | ---: | ---: |")
  for (const item of quote.items) {
    const lineTotal = Math.max(0, item.quantity) * Math.max(0, item.rate)
    lines.push(
      `| ${item.description || "(no description)"} | ${formatQuantity(item.quantity)} | ${money(item.rate)} | ${money(lineTotal)} |`
    )
  }
  lines.push("")

  lines.push("## Totals")
  lines.push("")
  lines.push(`- Subtotal: ${money(totals.subtotal)}`)
  if (totals.discount > 0) {
    lines.push(`- Discount: -${money(totals.discount)}`)
  }
  if (totals.tax > 0) {
    lines.push(`- ${quote.taxLabel || "Tax"} (${quote.taxRate}%): ${money(totals.tax)}`)
  }
  lines.push(`- **Total: ${money(totals.total)}**`)
  if (totals.deposit > 0) {
    lines.push(`- Deposit (${quote.depositPercent}%): ${money(totals.deposit)}`)
    lines.push(`- **Balance due: ${money(totals.balance)}**`)
  }
  lines.push("")

  if (quote.notes.trim()) {
    lines.push("## Notes")
    lines.push("")
    lines.push(quote.notes.trim())
    lines.push("")
  }

  lines.push("---")
  lines.push("")
  lines.push("Generated by Minimalist Toolkit. Amounts are calculated from the line items above.")
  lines.push("")

  return lines.join("\n")
}

/**
 * Trigger a browser download. Uses an object URL so it works without a
 * server round trip.
 */
export function downloadFile(filename: string, content: string, mimeType: string): void {
  if (typeof document === "undefined") return
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * File name for an export, for example "Q-2026-0042-acme-studio.csv".
 */
export function documentFileName(quote: QuoteDocument, extension = "csv"): string {
  const client = quote.client.company.trim() || quote.client.name.trim() || "client"
  const number = quote.number.trim() || "document"
  return `${number}-${slugify(client)}.${extension}`
}
