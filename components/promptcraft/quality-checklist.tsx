"use client"

import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ChecklistEntry {
  id: string
  label: string
  /** What the check actually looks for in the generated text. */
  hint: string
  detected: boolean
}

const ROLE_PATTERN =
  /(^|\n)\s*(you are|you'?re|act as|your role is|you will be|as an? [a-z-]+ expert)\b/i

const TASK_PATTERN =
  /(^|\n|\b)(your task is|task:|write|create|generate|produce|draft|analy[sz]e|summari[sz]e|explain|compare|translate|rewrite|review|list|build|design|plan|outline|classify|extract|compose|prepare)\b/i

const CONSTRAINT_PATTERN =
  /\b(must|must not|should|should not|do not|don'?t|avoid|never|no more than|no fewer than|at least|at most|maximum|minimum|exactly|only|between|within|under|limited to|up to|no longer than)\b/i

const FORMAT_PATTERN =
  /\b(output format|format|respond (in|with|using)|reply (in|with|using)|return (it |the result )?(as|in)|as (a |an )?(json|markdown|csv|html|xml|bullet(ed)? list|numbered list|table|list)|in \d+ (words|sentences|paragraphs|bullets|items)|word count|character limit|structured as|section headings)\b/i

function detect(text: string, pattern: RegExp): boolean {
  return pattern.test(text)
}

/**
 * Static quality checklist for a generated prompt.
 *
 * Each entry is only marked as met when the generated text contains an
 * explicit, detectable signal. Anything that cannot be proven from the text
 * is reported as "not detected" rather than claimed as a pass.
 */
export function analyzePromptQuality(text: string): ChecklistEntry[] {
  const trimmed = text.trim()
  return [
    {
      id: "role",
      label: "Clear role",
      hint: "Opens with a role such as \"You are an expert...\"",
      detected: detect(trimmed, ROLE_PATTERN),
    },
    {
      id: "task",
      label: "Clear task",
      hint: "States the action to perform, e.g. \"Write...\" or \"Your task is...\"",
      detected: detect(trimmed, TASK_PATTERN),
    },
    {
      id: "constraints",
      label: "Constraints",
      hint: "Contains explicit limits such as \"must\", \"avoid\" or \"no more than\"",
      detected: detect(trimmed, CONSTRAINT_PATTERN),
    },
    {
      id: "format",
      label: "Output format",
      hint: "Names an output shape such as JSON, a bullet list or a word limit",
      detected: detect(trimmed, FORMAT_PATTERN),
    },
  ]
}

export function PromptQualityChecklist({ text }: { text: string }) {
  const entries = analyzePromptQuality(text)
  const met = entries.filter((e) => e.detected).length

  return (
    <section
      aria-label="Prompt quality checklist"
      className="rounded-lg border border-border/60 bg-secondary/20 px-3 py-3"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
          Quality checklist
        </h3>
        <span className="font-mono text-[10px] text-muted-foreground/50">
          {met}/{entries.length} detected
        </span>
      </div>
      <ul className="flex flex-col gap-1.5">
        {entries.map((entry) => (
          <li key={entry.id} className="flex items-start gap-2">
            <span
              className={cn(
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                entry.detected
                  ? "border-success/40 bg-success/10 text-success"
                  : "border-border bg-muted text-muted-foreground/50"
              )}
              aria-hidden="true"
            >
              {entry.detected ? (
                <Check className="h-2.5 w-2.5" />
              ) : (
                <X className="h-2.5 w-2.5" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-xs font-medium text-foreground/85">{entry.label}</span>
              <span className="block text-[11px] leading-4 text-muted-foreground/60">
                {entry.detected ? entry.hint : "Not detected in this output."}
              </span>
            </span>
            <span className="sr-only">
              {entry.detected ? "Detected" : "Not detected"}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[10px] leading-4 text-muted-foreground/45">
        Checks are literal text matches. A missing signal does not mean the prompt
        is weak, only that it was not spelled out.
      </p>
    </section>
  )
}
