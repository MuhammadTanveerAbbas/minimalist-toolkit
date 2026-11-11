import type { PrioritizationItem, PrioritizationProject } from "./types"
import {
  boundsFor,
  clampFieldValue,
  rankItems,
  resolveCriterionField,
  scoreItem,
  type CriterionField,
} from "./scoring"

/**
 * Rank fragility analysis.
 *
 * The question this answers: if my assumptions are a bit wrong, does the
 * roadmap order change? Each item is re-scored with one input moved up or
 * down by a percentage, the whole list is re-ranked, and the item's best and
 * worst reachable rank is recorded.
 */

export interface FragilityResult {
  itemId: string
  /** Best (lowest) rank the item could reach under the tested perturbations. */
  bestRank: number
  /** Worst (highest) rank the item could reach under the tested perturbations. */
  worstRank: number
  /** Rank the item holds with the current inputs. */
  currentRank: number
  /** True when the rank moves by two places or more. */
  isFragile: boolean
  /** Names of the inputs responsible for the largest movement. */
  drivers: string[]
}

export interface ScoreSpread {
  min: number
  max: number
  mean: number
  /** Difference between first and second place. 0 when there is no second place. */
  gap: number
}

export interface TopOverlap {
  /** Items in the top 5 of both scenarios. */
  shared: PrioritizationItem[]
  /** Items in the top 5 of scenario A that fall out of the top 5 in scenario B. */
  dropped: PrioritizationItem[]
  /** Items that enter the top 5 in scenario B. */
  entered: PrioritizationItem[]
}

const DRIVER_LABELS: Record<CriterionField, string> = {
  reach: "Reach",
  impact: "Impact",
  confidence: "Confidence",
  effort: "Effort",
  costOfDelay: "Cost of Delay",
  jobSize: "Job Size",
}

/**
 * Fields that can move a rank for a given project.
 *
 * In the custom weighted mode the tested fields are exactly the ones the
 * criteria read. In a built in framework the three inputs teams argue about
 * most (Impact, Confidence, Effort) are always tested, plus the remaining
 * field that the formula actually uses: Reach for RICE, Cost of Delay and
 * Job Size for WSJF.
 */
function relevantFields(project: PrioritizationProject): CriterionField[] {
  const fields = new Set<CriterionField>(["impact", "confidence", "effort"])

  if (project.mode === "weighted") {
    for (const criterion of project.criteria) {
      const field = resolveCriterionField(criterion)
      if (field) fields.add(field)
    }
    return [...fields]
  }

  if (project.framework === "RICE") fields.add("reach")
  if (project.framework === "WSJF") {
    fields.add("costOfDelay")
    fields.add("jobSize")
  }
  return [...fields]
}

interface Perturbation {
  field: CriterionField
  factor: number
}

function perturbationsFor(
  project: PrioritizationProject,
  percent: number
): Perturbation[] {
  const fields = relevantFields(project)
  const perturbations: Perturbation[] = []
  for (const field of fields) {
    perturbations.push({ field, factor: 1 + percent / 100 })
    perturbations.push({ field, factor: 1 - percent / 100 })
  }
  return perturbations
}

function withField(
  item: PrioritizationItem,
  field: CriterionField,
  factor: number,
  project: PrioritizationProject
): PrioritizationItem {
  const current = item[field] as unknown as number
  const next = current * factor
  return {
    ...item,
    [field]: clampFieldValue(field, next, boundsFor(project)),
  } as PrioritizationItem
}

/**
 * Perturb each item's inputs one at a time and report how far its rank can
 * move. `percent` is the size of the perturbation, e.g. 20 for +/-20%.
 */
export function fragilityAnalysis(
  items: PrioritizationItem[],
  project: PrioritizationProject,
  percent = 20
): FragilityResult[] {
  if (items.length === 0) return []

  const baseRanking = rankItems(items, project)
  const baseRankById = new Map(baseRanking.map((entry) => [entry.item.id, entry.rank]))

  const perturbations = perturbationsFor(project, percent)
  const results: FragilityResult[] = []

  for (const target of items) {
    const currentRank = baseRankById.get(target.id) ?? 1
    let bestRank = currentRank
    let worstRank = currentRank
    const movementByField = new Map<CriterionField, number>()

    for (const perturbation of perturbations) {
      const changed = withField(target, perturbation.field, perturbation.factor, project)
      const nextItems = items.map((item) => (item.id === target.id ? changed : item))
      const nextRanking = rankItems(nextItems, project)
      const nextRank = nextRanking.find((entry) => entry.item.id === target.id)?.rank ?? currentRank

      if (nextRank < bestRank) bestRank = nextRank
      if (nextRank > worstRank) worstRank = nextRank

      const movement = Math.abs(nextRank - currentRank)
      const current = movementByField.get(perturbation.field) ?? 0
      if (movement > current) movementByField.set(perturbation.field, movement)
    }

    const maxMovement = Math.max(0, ...movementByField.values())
    const drivers = [...movementByField.entries()]
      .filter(([, movement]) => movement === maxMovement && movement > 0)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([field]) => DRIVER_LABELS[field])

    results.push({
      itemId: target.id,
      bestRank,
      worstRank,
      currentRank,
      isFragile: worstRank - bestRank >= 2,
      drivers,
    })
  }

  return results
}

/**
 * Lowest, highest, average score and the gap between first and second place.
 * A large gap means the top of the ranking is decided, a tiny gap means the
 * order is a coin flip.
 */
export function scoreSpread(
  items: PrioritizationItem[],
  project: PrioritizationProject
): ScoreSpread {
  if (items.length === 0) {
    return { min: 0, max: 0, mean: 0, gap: 0 }
  }

  const scores = items.map((item) => scoreItem(item, project))
  const sorted = [...scores].sort((a, b) => b - a)
  const total = scores.reduce((sum, value) => sum + value, 0)

  return {
    min: Math.min(...scores),
    max: Math.max(...scores),
    mean: Math.round((total / scores.length) * 100) / 100,
    gap: sorted.length > 1 ? Math.round((sorted[0] - sorted[1]) * 100) / 100 : 0,
  }
}

/**
 * Compare the top 5 of two scenarios. Used to show what a change in weights
 * or inputs actually does to the shortlist.
 */
export function topOverlap(
  itemsA: PrioritizationItem[],
  projectA: PrioritizationProject,
  itemsB: PrioritizationItem[],
  projectB: PrioritizationProject
): TopOverlap {
  const topA = rankItems(itemsA, projectA).slice(0, 5).map((entry) => entry.item)
  const topB = rankItems(itemsB, projectB).slice(0, 5).map((entry) => entry.item)
  const idsB = new Set(topB.map((item) => item.id))

  const shared = topA.filter((item) => idsB.has(item.id))
  const dropped = topA.filter((item) => !idsB.has(item.id))
  const idsA = new Set(topA.map((item) => item.id))
  const entered = topB.filter((item) => !idsA.has(item.id))

  return { shared, dropped, entered }
}
