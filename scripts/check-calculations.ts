/**
 * Calculation checks for the deterministic tools.
 *
 * These run with the Node type stripper, so no test runner or extra
 * dependency is required:
 *
 *   node --experimental-strip-types scripts/check-calculations.ts
 *
 * The assertions cover the arithmetic that a user can get wrong by eye:
 * discounts, tax, deposits, due dates, framework scores and weight
 * normalisation.
 */

import {
  balanceDue,
  depositAmount,
  discountAmount,
  documentTotals,
  dueDate,
  formatMoney,
  isOverdue,
  lineTotal,
  subtotal,
  suggestNextNumber,
  taxAmount,
  total,
} from "../lib/quotes/calculate.ts"
import {
  iceScore,
  normaliseWeights,
  rankItems,
  riceScore,
  scoreItem,
  weightedScore,
  wsjfScore,
} from "../lib/prioritizer/scoring.ts"
import {
  fragilityAnalysis,
  scoreSpread,
  topOverlap,
} from "../lib/prioritizer/analysis.ts"

let failures = 0

function check(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (ok) {
    console.log(`ok   ${name} = ${JSON.stringify(actual)}`)
    return
  }
  failures += 1
  console.log(`FAIL ${name}: got ${JSON.stringify(actual)} want ${JSON.stringify(expected)}`)
}

/* ── Quotes arithmetic ─────────────────────────────────────────────────── */

check("lineTotal", lineTotal({ id: "1", description: "", quantity: 3, rate: 12.5 }), 37.5)
check(
  "lineTotal clamps negatives",
  lineTotal({ id: "1", description: "", quantity: -3, rate: 12.5 }),
  0
)
check(
  "subtotal",
  subtotal([
    { id: "1", description: "", quantity: 2, rate: 50 },
    { id: "2", description: "", quantity: 1, rate: 25.5 },
  ]),
  125.5
)
check("subtotal of no items", subtotal([]), 0)
check("discount percent", discountAmount(200, "percent", 10), 20)
check("discount percent cannot exceed the subtotal", discountAmount(200, "percent", 150), 200)
check("discount fixed is clamped to the subtotal", discountAmount(200, "fixed", 500), 200)
check("discount on an empty subtotal", discountAmount(0, "percent", 10), 0)
check("tax is charged on the discounted base", taxAmount(180, 20), 36)
check("tax rate is clamped", taxAmount(100, 250), 100)
check("total", total(200, 20, 36), 216)
check("deposit", depositAmount(200, 30), 60)
check("deposit percent is clamped", depositAmount(200, 150), 200)
check("balance", balanceDue(200, 60), 140)
check("due date adds the terms", dueDate("2026-03-01", 15), "2026-03-16")
check("an unparsable date is returned unchanged", dueDate("not-a-date", 15), "not-a-date")
check("a past due date is overdue", isOverdue("2020-01-01", "sent"), true)
check("a paid document is not overdue", isOverdue("2020-01-01", "paid"), false)
check("a declined document is not overdue", isOverdue("2020-01-01", "declined"), false)
check("a future due date is not overdue", isOverdue("2099-01-01", "sent"), false)
check("money formatting", formatMoney(1234.5, "USD"), "$1,234.50")
check("the first document number", suggestNextNumber([], "quote", "2026-03-01"), "Q-2026-0001")
check(
  "document numbers increment",
  suggestNextNumber(["Q-2026-0001", "Q-2026-0007"], "quote", "2026-03-01"),
  "Q-2026-0008"
)
check(
  "quotes and invoices keep separate sequences",
  suggestNextNumber(["Q-2026-0009"], "invoice", "2026-03-01"),
  "INV-2026-0001"
)

const invoice = {
  id: "d1",
  kind: "invoice" as const,
  number: "INV-2026-0001",
  status: "sent" as const,
  client: { name: "Acme", company: "", email: "", address: "" },
  items: [{ id: "1", description: "Work", quantity: 2, rate: 100 }],
  currency: "USD" as const,
  taxLabel: "VAT",
  taxRate: 20,
  discountType: "percent" as const,
  discountValue: 10,
  depositPercent: 30,
  terms: 15 as const,
  issuedOn: "2026-03-01",
  expiresOn: "",
  notes: "",
  linkedQuoteNumber: null,
  createdAt: "2026-03-01T00:00:00Z",
  updatedAt: "2026-03-01T00:00:00Z",
}

const totals = documentTotals(invoice)
check("document subtotal", totals.subtotal, 200)
check("document discount", totals.discount, 20)
check("document tax", totals.tax, 36)
check("document total", totals.total, 216)
check("document deposit", totals.deposit, 64.8)
check("document balance", totals.balance, 151.2)
check("document due date", totals.dueDate, "2026-03-16")

/* ── Prioritizer scoring ───────────────────────────────────────────────── */

const item = {
  id: "i1",
  name: "Feature",
  description: "",
  reach: 1000,
  impact: 2,
  confidence: 0.8,
  effort: 4,
  costOfDelay: 2,
  jobSize: 1,
  evidence: {},
}

check("rice score", riceScore(item), 400)
check("a zero effort scores zero rather than infinity", riceScore({ ...item, effort: 0 }), 0)
// ICE reads confidence on its own 1 to 10 scale, so 0.8 is clamped up to 1.
// Ease is derived as 11 minus the effort rating, so effort 4 gives ease 7.
check("ice score", iceScore(item), 2 * 1 * 7)
check("wsjf score", wsjfScore(item), 2)
check("a zero job size is clamped", wsjfScore({ ...item, jobSize: 0 }), 4)

const normalised = normaliseWeights([
  { id: "a", name: "A", weight: 30, lowerIsBetter: false },
  { id: "b", name: "B", weight: 30, lowerIsBetter: false },
  { id: "c", name: "C", weight: 25, lowerIsBetter: false },
  { id: "d", name: "D", weight: 15, lowerIsBetter: true },
])
check(
  "normalised weights sum to 100",
  Math.round(normalised.reduce((acc, c) => acc + c.weight, 0) * 100) / 100,
  100
)
check("normalisation preserves the ratio", normalised[0].weight, 30)

const evenSplit = normaliseWeights([
  { id: "a", name: "A", weight: 0, lowerIsBetter: false },
  { id: "b", name: "B", weight: 0, lowerIsBetter: false },
])
check("all-zero weights split evenly", evenSplit[0].weight, 50)

const project = {
  items: [
    { ...item, id: "a", name: "Alpha" },
    { ...item, id: "b", name: "Beta", reach: 2000 },
    { ...item, id: "c", name: "Gamma", reach: 10 },
  ],
  framework: "RICE" as const,
  criteria: [],
  mode: "framework" as const,
}

const ranked = rankItems(project.items, project)
check("ranking order", ranked.map((entry) => entry.item.name), ["Beta", "Alpha", "Gamma"])
check("ranks start at one", ranked[0].rank, 1)
check("scoreItem matches riceScore", scoreItem(project.items[0], project), 400)

const weightedProject = {
  ...project,
  mode: "weighted" as const,
  criteria: [
    { id: "reach", name: "Reach", field: "reach" as const, weight: 50, lowerIsBetter: false },
    { id: "effort", name: "Effort", field: "effort" as const, weight: 50, lowerIsBetter: true },
  ],
}
check(
  "the weighted score is a finite number",
  Number.isFinite(
    weightedScore(project.items[0], weightedProject.criteria, { pool: project.items })
  ),
  true
)

const fragility = fragilityAnalysis(project.items, project, 20)
check("fragility reports every item", fragility.length, 3)
check("fragility reports a rank for every item", fragility.every((f) => f.currentRank >= 1), true)

const spread = scoreSpread(project.items, project)
check("spread maximum", spread.max, 800)
check("spread minimum", spread.min, 4)
check("spread gap", spread.gap, 400)

const overlap = topOverlap(project.items, project, project.items, project)
check("identical scenarios share every item", overlap.shared.length, 3)
check("identical scenarios drop nothing", overlap.dropped.length, 0)

console.log(failures === 0 ? "\nAll calculation checks passed." : `\n${failures} check(s) failed.`)
process.exit(failures === 0 ? 0 : 1)
