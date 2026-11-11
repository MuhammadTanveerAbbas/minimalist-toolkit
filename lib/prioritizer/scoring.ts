import type {
  Confidence,
  Criterion,
  Framework,
  PrioritizationItem,
  PrioritizationProject,
} from "./types"
import type { CriterionField } from "./types"

export type { CriterionField }

/**
 * Deterministic scoring engine for the Prioritizer.
 *
 * Everything in this file is pure: no React, no storage, no network. The same
 * inputs always produce the same scores, which is what makes the exported
 * decision record defensible.
 *
 * Formulas
 * --------
 * RICE  score = (reach x impact x confidence) / effort
 * ICE   score = impact x confidence x ease, where ease = clamp(11 - effort, 1, 10)
 * WSJF  score = costOfDelay / jobSize
 * Custom score = sum over criteria of (normalised value x weight), with the
 *               weights normalised to exactly 100.
 *
 * Scores are never NaN and never Infinity. Every raw input is clamped into a
 * valid range before it is used.
 */

export type Bounds = { min: number; max: number }

export type BoundsTable = Record<CriterionField, Bounds>

/** Hard bounds used to keep user supplied numbers inside valid ranges. */
export const FIELD_VALID_BOUNDS: Record<Framework, BoundsTable> = {
  RICE: {
    reach: { min: 0, max: 1_000_000 },
    impact: { min: 0.5, max: 3 },
    confidence: { min: 0, max: 1 },
    effort: { min: 0, max: 120 },
    costOfDelay: { min: 0.5, max: 3 },
    jobSize: { min: 0.5, max: 3 },
  },
  ICE: {
    reach: { min: 0, max: 1_000_000 },
    impact: { min: 1, max: 10 },
    confidence: { min: 1, max: 10 },
    effort: { min: 1, max: 10 },
    costOfDelay: { min: 0.5, max: 3 },
    jobSize: { min: 0.5, max: 3 },
  },
  WSJF: {
    reach: { min: 0, max: 1_000_000 },
    impact: { min: 0.5, max: 3 },
    confidence: { min: 0, max: 1 },
    effort: { min: 0, max: 120 },
    costOfDelay: { min: 0.5, max: 3 },
    jobSize: { min: 0.5, max: 3 },
  },
}

/**
 * Reference ranges used to turn a raw number into a 0..1 value when there is
 * no set of items to compare against. They describe a "typical" item, not a
 * limit: values outside the range are still accepted and simply saturate.
 */
export const FIELD_REFERENCE_BOUNDS: Record<Framework, BoundsTable> = {
  RICE: {
    reach: { min: 0, max: 1000 },
    impact: { min: 0.5, max: 3 },
    confidence: { min: 0, max: 1 },
    effort: { min: 0, max: 12 },
    costOfDelay: { min: 0.5, max: 3 },
    jobSize: { min: 0.5, max: 3 },
  },
  ICE: {
    reach: { min: 0, max: 1000 },
    impact: { min: 1, max: 10 },
    confidence: { min: 1, max: 10 },
    effort: { min: 1, max: 10 },
    costOfDelay: { min: 0.5, max: 3 },
    jobSize: { min: 0.5, max: 3 },
  },
  WSJF: {
    reach: { min: 0, max: 1000 },
    impact: { min: 0.5, max: 3 },
    confidence: { min: 0, max: 1 },
    effort: { min: 0, max: 12 },
    costOfDelay: { min: 0.5, max: 3 },
    jobSize: { min: 0.5, max: 3 },
  },
}

export const FIELD_LABELS: Record<CriterionField, string> = {
  reach: "Reach",
  impact: "Impact",
  confidence: "Confidence",
  effort: "Effort",
  costOfDelay: "Cost of Delay",
  jobSize: "Job Size",
}

/** Fields that feed each built in framework. */
export const FRAMEWORK_FIELDS: Record<Framework, CriterionField[]> = {
  RICE: ["reach", "impact", "confidence", "effort"],
  ICE: ["impact", "confidence", "effort"],
  WSJF: ["costOfDelay", "jobSize"],
}

export const FRAMEWORK_SUMMARIES: Record<Framework, string> = {
  RICE:
    "RICE = (Reach x Impact x Confidence) / Effort. Reach is users per period, Impact is 0.5 to 3, Confidence is 0 to 1 and Effort is person-months.",
  ICE: "ICE = Impact x Confidence x Ease. Ease is derived from Effort as 11 - Effort, so a lower Effort score means a higher Ease score.",
  WSJF:
    "WSJF = Cost of Delay / Job Size. Both values are on a 0.5 to 3 scale and both are clamped so the score stays finite.",
}

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  if (value < min) return min
  if (value > max) return max
  return value
}

export function round2(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.round(value * 100) / 100
}

function safeNumber(value: number, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

/**
 * Bounds that apply to the raw inputs of a project.
 *
 * The custom weighted mode always uses the RICE conventions (reach in users
 * per period, impact 0.5 to 3, confidence 0 to 1, effort in person-months) so
 * the numbers keep one meaning across modes.
 */
export function boundsFor(project: PrioritizationProject): BoundsTable {
  if (project.mode === "weighted") return FIELD_VALID_BOUNDS.RICE
  return FIELD_VALID_BOUNDS[project.framework]
}

/** Reference bounds used when a value has to be normalised without a pool. */
export function referenceBoundsFor(project: PrioritizationProject): BoundsTable {
  if (project.mode === "weighted") return FIELD_REFERENCE_BOUNDS.RICE
  return FIELD_REFERENCE_BOUNDS[project.framework]
}

/** Clamp a raw item value into the valid range for the project. */
export function clampFieldValue(
  field: CriterionField,
  value: number,
  bounds: BoundsTable
): number {
  const range = bounds[field]
  return clamp(safeNumber(value, range.min), range.min, range.max)
}

/**
 * RICE score. Returns 0 when effort is 0 so the result is never Infinity.
 */
export function riceScore(item: PrioritizationItem): number {
  const bounds = FIELD_VALID_BOUNDS.RICE
  const reach = clampFieldValue("reach", item.reach, bounds)
  const impact = clampFieldValue("impact", item.impact, bounds)
  const confidence = clampFieldValue("confidence", item.confidence, bounds)
  const effort = clampFieldValue("effort", item.effort, bounds)
  if (effort <= 0) return 0
  const score = (reach * impact * confidence) / effort
  return Number.isFinite(score) ? score : 0
}

/**
 * ICE score: Impact x Confidence x Ease, where Ease = clamp(11 - Effort, 1, 10).
 * The Effort field is an effort rating, so a bigger number means more work.
 */
export function iceScore(item: PrioritizationItem): number {
  const bounds = FIELD_VALID_BOUNDS.ICE
  const impact = clampFieldValue("impact", item.impact, bounds)
  const confidence = clampFieldValue("confidence", item.confidence, bounds)
  const effort = clampFieldValue("effort", item.effort, bounds)
  const ease = clamp(11 - effort, 1, 10)
  const score = impact * confidence * ease
  return Number.isFinite(score) ? score : 0
}

/**
 * WSJF score: Cost of Delay / Job Size, both clamped to a minimum of 0.5 so
 * the quotient is always finite.
 */
export function wsjfScore(item: PrioritizationItem): number {
  const bounds = FIELD_VALID_BOUNDS.WSJF
  const costOfDelay = Math.max(0.5, clampFieldValue("costOfDelay", item.costOfDelay, bounds))
  const jobSize = Math.max(0.5, clampFieldValue("jobSize", item.jobSize, bounds))
  const score = costOfDelay / jobSize
  return Number.isFinite(score) ? score : 0
}

/**
 * Normalise weights so they sum to exactly 100 while keeping their relative
 * intent. A user raising one weight therefore lowers the share of the rest.
 *
 * Rounding happens in integer hundredths so the total is exact.
 */
export function normaliseWeights(criteria: Criterion[]): Criterion[] {
  const count = criteria.length
  if (count === 0) return []

  const raw = criteria.map((c) => Math.max(0, safeNumber(c.weight, 0)))
  const total = raw.reduce((sum, value) => sum + value, 0)

  const cents: number[] = new Array(count).fill(0)

  if (total <= 0) {
    // Every weight is zero: split evenly.
    const base = Math.floor(10000 / count)
    let remainder = 10000 - base * count
    for (let i = 0; i < count; i += 1) {
      cents[i] = base + (remainder > 0 ? 1 : 0)
      if (remainder > 0) remainder -= 1
    }
  } else {
    const exact = raw.map((value) => (value / total) * 10000)
    const fractional = exact.map((value, index) => ({
      index,
      whole: Math.floor(value),
      remainder: value - Math.floor(value),
    }))
    let used = 0
    for (const entry of fractional) {
      cents[entry.index] = entry.whole
      used += entry.whole
    }
    let left = 10000 - used
    const order = [...fractional].sort(
      (a, b) => b.remainder - a.remainder || a.index - b.index
    )
    for (const entry of order) {
      if (left <= 0) break
      cents[entry.index] += 1
      left -= 1
    }
  }

  const weights = criteria.map((criterion, index) => ({
    ...criterion,
    weight: cents[index] / 100,
  }))

  // Floating point addition can leave the total a hair away from 100.
  // Give the residual to the largest weight so the sum is exact.
  const sum = weights.reduce((acc, entry) => acc + entry.weight, 0)
  const residual = 100 - sum
  if (Math.abs(residual) > 1e-9 && weights.length > 0) {
    let largest = 0
    for (let i = 1; i < weights.length; i += 1) {
      if (weights[i].weight > weights[largest].weight) largest = i
    }
    weights[largest] = { ...weights[largest], weight: weights[largest].weight + residual }
  }

  return weights
}

/**
 * Resolve which raw input a criterion reads. An explicit `field` wins, then a
 * field-shaped id, then the criterion name.
 */
export function resolveCriterionField(criterion: Criterion): CriterionField | null {
  if (criterion.field) return criterion.field
  const id = criterion.id.trim().toLowerCase()
  if (id in FIELD_LABELS) return id as CriterionField
  const name = criterion.name.trim().toLowerCase()
  const direct = Object.keys(FIELD_LABELS).find((key) => key.toLowerCase() === name)
  if (direct) return direct as CriterionField
  const aliases: Record<string, CriterionField> = {
    reach: "reach",
    users: "reach",
    audience: "reach",
    impact: "impact",
    value: "impact",
    confidence: "confidence",
    certainty: "confidence",
    effort: "effort",
    cost: "effort",
    work: "effort",
    "cost of delay": "costOfDelay",
    cod: "costOfDelay",
    delaycost: "costOfDelay",
    "job size": "jobSize",
    size: "jobSize",
  }
  return aliases[name] ?? null
}

function normaliseValue(value: number, lowerIsBetter: boolean, bounds: Bounds): number {
  const span = bounds.max - bounds.min
  if (span <= 0) return 0
  const ratio = clamp((value - bounds.min) / span, 0, 1)
  return lowerIsBetter ? 1 - ratio : ratio
}

export interface WeightedContext {
  /** Items used to derive relative bounds. */
  pool?: PrioritizationItem[]
  /** Fallback bounds when the pool cannot produce a usable range. */
  reference?: BoundsTable
}

/**
 * Custom weighted score.
 *
 * Each criterion value is normalised to 0..1 and multiplied by its weight.
 * When a pool of items is supplied the normalisation is relative to that set
 * (0 = worst in the set, 1 = best in the set), which is what makes a weighted
 * model comparable inside one roadmap. Without a pool the reference ranges are
 * used instead.
 */
export function weightedScore(
  item: PrioritizationItem,
  criteria: Criterion[],
  context: WeightedContext = {}
): number {
  if (criteria.length === 0) return 0
  const weights = normaliseWeights(criteria)
  const reference = context.reference ?? FIELD_REFERENCE_BOUNDS.RICE

  let total = 0
  for (const criterion of weights) {
    const field = resolveCriterionField(criterion)
    if (!field) continue
    const value = safeNumber(item[field] as unknown as number, 0)
    const bounds = poolBounds(context.pool, field) ?? reference[field]
    const normalised = normaliseValue(value, criterion.lowerIsBetter, bounds)
    total += normalised * criterion.weight
  }
  return Number.isFinite(total) ? total : 0
}

function poolBounds(
  pool: PrioritizationItem[] | undefined,
  field: CriterionField
): Bounds | null {
  if (!pool || pool.length < 2) return null
  let min = Number.POSITIVE_INFINITY
  let max = Number.NEGATIVE_INFINITY
  for (const entry of pool) {
    const value = safeNumber(entry[field] as unknown as number, 0)
    if (value < min) min = value
    if (value > max) max = value
  }
  if (!Number.isFinite(min) || !Number.isFinite(max) || max === min) return null
  return { min, max }
}

/**
 * Score a single item against a project. The project decides which formula
 * runs: "weighted" uses the custom criteria, otherwise the named framework.
 */
export function scoreItem(item: PrioritizationItem, project: PrioritizationProject): number {
  let raw = 0
  if (project.mode === "weighted") {
    raw = weightedScore(item, project.criteria, {
      pool: project.items,
      reference: referenceBoundsFor(project),
    })
  } else if (project.framework === "RICE") {
    raw = riceScore(item)
  } else if (project.framework === "ICE") {
    raw = iceScore(item)
  } else {
    raw = wsjfScore(item)
  }
  return round2(raw)
}

export interface RankedItem {
  item: PrioritizationItem
  score: number
  /** 1 based position after sorting. */
  rank: number
  /** Position of the item in the unsorted list, so ties stay traceable. */
  originalIndex: number
  /** True when a neighbouring item has the same score. */
  tied: boolean
}

/**
 * Rank items by score, descending. Ties are broken by name (case
 * insensitive) and then by the original position, so the order is stable.
 */
export function rankItems(
  items: PrioritizationItem[],
  project: PrioritizationProject
): RankedItem[] {
  const scored = items.map((item, originalIndex) => ({
    item,
    score: scoreItem(item, project),
    originalIndex,
  }))

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    const byName = a.item.name.trim().localeCompare(b.item.name.trim())
    if (byName !== 0) return byName
    return a.originalIndex - b.originalIndex
  })

  return scored.map((entry, index) => {
    const previous = scored[index - 1]
    const next = scored[index + 1]
    const tied =
      (previous !== undefined && previous.score === entry.score) ||
      (next !== undefined && next.score === entry.score)
    return { ...entry, rank: index + 1, tied }
  })
}

/** Default criteria shipped with each framework. */
export function defaultCriteria(framework: Framework): Criterion[] {
  if (framework === "RICE") {
    return [
      {
        id: "reach",
        name: "Reach",
        field: "reach",
        weight: 30,
        lowerIsBetter: false,
        description: "Users affected in one period.",
      },
      {
        id: "impact",
        name: "Impact",
        field: "impact",
        weight: 30,
        lowerIsBetter: false,
        description: "How much the outcome moves per user.",
      },
      {
        id: "confidence",
        name: "Confidence",
        field: "confidence",
        weight: 25,
        lowerIsBetter: false,
        description: "How sure you are of the impact estimate.",
      },
      {
        id: "effort",
        name: "Effort",
        field: "effort",
        weight: 15,
        lowerIsBetter: true,
        description: "Cost to build. Lower is better.",
      },
    ]
  }
  if (framework === "ICE") {
    return [
      {
        id: "impact",
        name: "Impact",
        field: "impact",
        weight: 40,
        lowerIsBetter: false,
        description: "How much the outcome moves per user.",
      },
      {
        id: "confidence",
        name: "Confidence",
        field: "confidence",
        weight: 35,
        lowerIsBetter: false,
        description: "How sure you are of the impact estimate.",
      },
      {
        id: "effort",
        name: "Effort",
        field: "effort",
        weight: 25,
        lowerIsBetter: true,
        description: "Work required. Lower effort means more ease.",
      },
    ]
  }
  return [
    {
      id: "costOfDelay",
      name: "Cost of Delay",
      field: "costOfDelay",
      weight: 60,
      lowerIsBetter: false,
      description: "Cost of not shipping this for one period.",
    },
    {
      id: "jobSize",
      name: "Job Size",
      field: "jobSize",
      weight: 40,
      lowerIsBetter: true,
      description: "How big the work is. Smaller is better.",
    },
  ]
}

/** Qualitative band for a confidence value, used in the UI and the export. */
export function confidenceBand(value: number, framework: Framework): Confidence {
  const bounds = FIELD_VALID_BOUNDS[framework].confidence
  const ratio =
    bounds.max === bounds.min
      ? 0
      : (safeNumber(value, bounds.min) - bounds.min) / (bounds.max - bounds.min)
  if (ratio >= 0.75) return "high"
  if (ratio >= 0.4) return "medium"
  return "low"
}

/**
 * The two scale conventions the item fields can use. WSJF does not define
 * impact, confidence or effort, so it borrows the RICE convention.
 */
type Scale = "RICE" | "ICE"

function scaleOf(framework: Framework): Scale {
  return framework === "ICE" ? "ICE" : "RICE"
}

/**
 * Reinterpret the shared numeric fields when the scale changes.
 *
 * The item shape stores one number per input, but RICE and ICE use different
 * scales for impact, confidence and effort. Switching therefore rescales those
 * three values so the intent survives the switch instead of silently
 * clamping to a wrong range.
 */
export function rescaleItem(
  item: PrioritizationItem,
  from: Framework,
  to: Framework
): PrioritizationItem {
  if (from === to) return item
  const next = { ...item }
  const fromScale = scaleOf(from)
  const toScale = scaleOf(to)

  if (fromScale === "RICE" && toScale === "ICE") {
    next.impact = round2(clamp(1 + ((item.impact - 0.5) / 2.5) * 9, 1, 10))
    next.confidence = round2(clamp(1 + item.confidence * 9, 1, 10))
    next.effort = round2(clamp(1 + (clamp(item.effort, 0, 12) / 12) * 9, 1, 10))
  } else if (fromScale === "ICE" && toScale === "RICE") {
    next.impact = round2(clamp(0.5 + ((item.impact - 1) / 9) * 2.5, 0.5, 3))
    next.confidence = round2(clamp((item.confidence - 1) / 9, 0, 1))
    next.effort = round2(clamp(((item.effort - 1) / 9) * 12, 0, 12))
  }

  next.impact = clampFieldValue("impact", next.impact, FIELD_VALID_BOUNDS[to])
  next.confidence = clampFieldValue("confidence", next.confidence, FIELD_VALID_BOUNDS[to])
  next.effort = clampFieldValue("effort", next.effort, FIELD_VALID_BOUNDS[to])
  next.costOfDelay = clampFieldValue("costOfDelay", next.costOfDelay, FIELD_VALID_BOUNDS[to])
  next.jobSize = clampFieldValue("jobSize", next.jobSize, FIELD_VALID_BOUNDS[to])
  return next
}
