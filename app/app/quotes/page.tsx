import type { Metadata } from "next"
import { QuotesTool } from "@/components/quotes/quotes-tool"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Quotes",
  description: "Build client quotes with tax, deposits and payment terms, then convert them to invoices.",
}

export default function QuotesPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Quotes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Scope the work, price it, and convert the quote into an invoice without retyping a line.
        </p>
      </div>
      <QuotesTool />
    </div>
  )
}
