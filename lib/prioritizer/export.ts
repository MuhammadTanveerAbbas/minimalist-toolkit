import type { FragilityResult } from "./analysis"
import { normaliseWeights, type RankedItem } from "./scoring"
import type { PrioritizationProject } from "./types"

/**
 * Export helpers. The CSV is for spreadsheets, the Markdown is a decision
 * record a founder can paste straight into a planning document.
 */

function escapeCsv(value: string | number | undefined): string {
  if (value === undefined || value === null) return ""
  const text = String(value)
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function csvRow(values: Array<string | number | undefined>): string {
  return values.map(escapeCsv).join(",")
}

/**
 * One row per item: rank, identity, every raw input, the computed score and
 * the evidence behind each number.
 */
export function toCsv(project: PrioritizationProject, ranked: RankedItem[]): string {
  const header = [
    "Rank",
    "Name",
    "Description",
    "Reach",
    "Impact",
    "Confidence",
    "Effort",
    "Cost of Delay",
    "Job Size",
    "Score",
    "Evidence - Reach",
    "Evidence - Impact",
    "Evidence - Confidence",
    "Evidence - Effort",
  ]

  const rows = ranked.map((entry) => {
    const item = entry.item
    return csvRow([
      entry.rank,
      item.name,
      item.description,
      item.reach,
      item.impact,
      item.confidence,
      item.effort,
      item.costOfDelay,
      item.jobSize,
      entry.score,
      item.evidence.reach ?? "",
      item.evidence.impact ?? "",
      item.evidence.confidence ?? "",
      item.evidence.effort ?? "",
    ])
  })

  return [csvRow(header), ...rows].join("\n")
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function criterionLine(name: string, weight: number, lowerIsBetter: boolean): string {
  return `| ${name} | ${weight.toFixed(2)}% | ${lowerIsBetter ? "Lower is better" : "Higher is better"} |`
}

/**
 * A readable decision record: what was scored, with which weights, in which
 * order, on what evidence, and which parts of the order are fragile.
 */
export interface MarkdownOptions {
  projectName?: string
  date?: Date
  /** Size of the perturbation used for the fragility pass, in percent. */
  perturbationPercent?: number
}

export function toMarkdown(
  project: PrioritizationProject,
  ranked: RankedItem[],
  fragility: FragilityResult[],
  options: MarkdownOptions = {}
): string {
  const projectName = options.projectName?.trim() || "Roadmap priorities"
  const date = options.date ?? new Date()
  const perturbationPercent = options.perturbationPercent ?? 20
  const lines: string[] = []
  const fragilityById = new Map(fragility.map((entry) => [entry.itemId, entry]))
  const weights = normaliseWeights(project.criteria)

  lines.push(`# ${projectName}`)
  lines.push("")
  lines.push(`**Date:** ${formatDate(date)}`)
  lines.push("")
  lines.push(
    project.mode === "weighted"
      ? "**Method:** Custom weighted model over normalised inputs."
      : `**Method:** ${project.framework} scoring.`
  )
  lines.push("")

  if (project.mode === "weighted") {
    lines.push("## Weights used")
    lines.push("")
    lines.push("| Criterion | Weight | Direction |")
    lines.push("| --- | --- | --- |")
    for (const criterion of weights) {
      lines.push(
        criterionLine(criterion.name, criterion.weight, criterion.lowerIsBetter)
      )
    }
    lines.push("")
  }

  lines.push("## Ranked options")
  lines.push("")
  lines.push("| # | Option | Score |")
  lines.push("| --- | --- | --- |")
  for (const entry of ranked) {
    lines.push(`| ${entry.rank} | ${entry.item.name} | ${entry.score} |`)
  }
  lines.push("")

  lines.push("## Score provenance")
  lines.push("")
  if (ranked.length === 0) {
    lines.push("No options scored yet.")
    lines.push("")
  }
  for (const entry of ranked) {
    const item = entry.item
    lines.push(`### ${entry.rank}. ${item.name}`)
    if (item.description.trim()) {
      lines.push("")
      lines.push(item.description.trim())
    }
    lines.push("")
    lines.push(`- **Score:** ${entry.score}`)
    lines.push(`- **Reach:** ${item.reach}${evidenceSuffix(item.evidence.reach)}`)
    lines.push(`- **Impact:** ${item.impact}${evidenceSuffix(item.evidence.impact)}`)
    lines.push(
      `- **Confidence:** ${item.confidence}${evidenceSuffix(item.evidence.confidence)}`
    )
    lines.push(`- **Effort:** ${item.effort}${evidenceSuffix(item.evidence.effort)}`)
    lines.push(`- **Cost of Delay:** ${item.costOfDelay}`)
    lines.push(`- **Job Size:** ${item.jobSize}`)
    lines.push("")
  }

  lines.push("## Fragility")
  lines.push("")
  const fragile = fragility.filter((entry) => entry.isFragile)
  if (fragile.length === 0) {
    lines.push(
      `No option changes rank by two places or more when its inputs are moved by ${perturbationPercent} percent, so this ordering is stable under small assumption changes.`
    )
    lines.push("")
  } else {
    lines.push(
      `These options move by two places or more when their inputs are changed by ${perturbationPercent} percent. Treat their position in the ranking as undecided until the evidence behind the listed drivers is confirmed.`
    )
    lines.push("")
    for (const entry of fragile) {
      const item = ranked.find((candidate) => candidate.item.id === entry.itemId)
      const name = item?.item.name ?? entry.itemId
      const drivers =
        entry.drivers.length > 0 ? entry.drivers.join(", ") : "unspecified inputs"
      lines.push(
        `- **${name}** currently sits at #${entry.currentRank} but can fall anywhere between #${entry.bestRank} and #${entry.worstRank}. It would have to be true that: ${drivers}.`
      )
    }
    lines.push("")
  }

  const missingEvidence = ranked.filter(
    (entry) =>
      !entry.item.evidence.reach?.trim() &&
      !entry.item.evidence.impact?.trim() &&
      !entry.item.evidence.confidence?.trim() &&
      !entry.item.evidence.effort?.trim()
  )
  if (missingEvidence.length > 0) {
    lines.push("## Evidence gaps")
    lines.push("")
    for (const entry of missingEvidence) {
      lines.push(
        `- ${entry.item.name} has no recorded evidence for reach, impact, confidence or effort.`
      )
    }
    lines.push("")
  }

  lines.push("---")
  lines.push("")
  lines.push(
    "Generated by Prioritizer. Scores are deterministic calculations from the numbers above; no estimates were made on your behalf."
  )
  lines.push("")

  return lines.join("\n")
}

function evidenceSuffix(evidence: string | undefined): string {
  const trimmed = evidence?.trim()
  return trimmed ? ` (${trimmed})` : ""
}

/**
 * Trigger a browser download. Uses an object URL so it works without a
 * server round trip.
 */
export function downloadFile(
  filename: string,
  content: string,
  mimeType: string
): void {
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
