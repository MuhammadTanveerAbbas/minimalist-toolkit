/**
 * Data model for the Prioritizer tool.
 *
 * The payload persisted through `useToolDocuments` is a single
 * `PrioritizationProject`. Document metadata (id, title, timestamps) is owned
 * by the persistence hook, so the project itself only carries the roadmap
 * data.
 */

export type Framework = "RICE" | "ICE" | "WSJF"

export type Confidence = "high" | "medium" | "low"

/** Raw inputs a criterion can read from an item. */
export type CriterionField =
  | "reach"
  | "impact"
  | "confidence"
  | "effort"
  | "costOfDelay"
  | "jobSize"

export interface Criterion {
  id: string
  name: string
  /** Raw 0..100 weight. Normalised to 100 at scoring time. */
  weight: number
  /** True when a smaller raw value is better, e.g. Effort. */
  lowerIsBetter: boolean
  description?: string
  /**
   * Which raw input this criterion reads. Optional so older payloads stay
   * valid; scoring falls back to matching the criterion name.
   */
  field?: CriterionField
}

export interface Evidence {
  /** Provenance for the reach number, e.g. "412 votes from 1,180 users". */
  reach?: string
  impact?: string
  confidence?: string
  effort?: string
}

export interface PrioritizationItem {
  id: string
  name: string
  description: string
  /** Users affected per period. */
  reach: number
  /** 0.5..3 in RICE, 1..10 in ICE. */
  impact: number
  /** 0..1 in RICE, 1..10 in ICE. */
  confidence: number
  /** Person-months in RICE, 1..10 effort rating in ICE. */
  effort: number
  /** 0.5..3, WSJF only. */
  costOfDelay: number
  /** 0.5..3, WSJF only. */
  jobSize: number
  evidence: Evidence
}

export interface PrioritizationProject {
  items: PrioritizationItem[]
  framework: Framework
  /** Criteria used by the custom weighted mode. */
  criteria: Criterion[]
  mode: "framework" | "weighted"
}

/**
 * What the persistence hook stores. `useToolDocuments` requires an `id` on the
 * payload type, so the document shape adds one to the project.
 */
export interface PrioritizationDocument extends PrioritizationProject {
  id: string
}

export const DEFAULT_PROJECT_TITLE = "Roadmap priorities"

export function createEmptyProject(framework: Framework = "RICE"): PrioritizationProject {
  return {
    items: [],
    framework,
    criteria: [],
    mode: "framework",
  }
}
