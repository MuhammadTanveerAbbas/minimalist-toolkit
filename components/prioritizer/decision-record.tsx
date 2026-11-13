"use client"

import { useState } from "react"
import { Check, Copy, Download, FileText } from "lucide-react"
import { downloadFile } from "@/lib/prioritizer/export"

export interface DecisionRecordProps {
  markdown: string
  projectName: string
  csv: string
}

/**
 * A preview of the exported decision record, so what gets copied is exactly
 * what gets pasted into a planning document.
 */
export function DecisionRecord({ markdown, projectName, csv }: DecisionRecordProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard access can be denied. The text is selectable on screen.
    }
  }

  const slug = projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold">Decision record</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            The ranking, the evidence behind each number, and which positions are fragile. Ready to paste
            into a planning doc.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copy}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-medium transition-colors hover:bg-accent md:min-h-10"
          >
            {copied ? (
              <Check className="h-4 w-4 text-success" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={() =>
              downloadFile(`${slug || "priorities"}.md`, markdown, "text/markdown")
            }
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-medium transition-colors hover:bg-accent md:min-h-10"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Markdown
          </button>
          <button
            type="button"
            onClick={() => downloadFile(`${slug || "priorities"}.csv`, csv, "text/csv")}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-foreground px-3 text-sm font-medium text-background transition-opacity hover:opacity-90 md:min-h-10"
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            CSV
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-2 px-4 py-2.5">
          <p className="min-w-0 break-words font-mono text-[11px] text-muted-foreground">
            {projectName || "Roadmap priorities"}.md
          </p>
          <span className="shrink-0 text-[11px] text-muted-foreground">
            {markdown.split("\n").length} lines
          </span>
        </div>
        <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap break-words px-4 py-4 font-mono text-[11px] leading-relaxed">
          {markdown}
        </pre>
      </div>
    </div>
  )
}
