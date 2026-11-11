"use client"

import { useId, useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { resolveCriterionField } from "@/lib/prioritizer/scoring"
import type {
  CriterionField,
  Evidence,
  PrioritizationItem,
  PrioritizationProject,
} from "@/lib/prioritizer/types"

interface FieldSpec {
  field: CriterionField
  label: string
  unit?: string
  min: number
  max: number
  step: number
  hint: string
}

const RICE_FIELDS: FieldSpec[] = [
  {
    field: "reach",
    label: "Reach",
    unit: "users per period",
    min: 0,
    max: 1_000_000,
    step: 10,
    hint: "How many people or accounts are affected in one period.",
  },
  {
    field: "impact",
    label: "Impact",
    min: 0.5,
    max: 3,
    step: 0.25,
    hint: "0.5 minimal, 1 low, 2 medium, 3 massive.",
  },
  {
    field: "confidence",
    label: "Confidence",
    unit: "0 to 1",
    min: 0,
    max: 1,
    step: 0.05,
    hint: "How much you trust the impact estimate. 1 is certain.",
  },
  {
    field: "effort",
    label: "Effort",
    unit: "person-months",
    min: 0,
    max: 120,
    step: 0.5,
    hint: "Engineering time to build and ship. Zero effort scores 0.",
  },
]

const ICE_FIELDS: FieldSpec[] = [
  {
    field: "impact",
    label: "Impact",
    min: 1,
    max: 10,
    step: 1,
    hint: "1 is a small improvement, 10 is transformational.",
  },
  {
    field: "confidence",
    label: "Confidence",
    min: 1,
    max: 10,
    step: 1,
    hint: "How sure you are about the impact number.",
  },
  {
    field: "effort",
    label: "Effort",
    unit: "1 to 10",
    min: 1,
    max: 10,
    step: 1,
    hint: "Effort rating. Ease is derived as 11 minus this number.",
  },
]

const WSJF_FIELDS: FieldSpec[] = [
  {
    field: "costOfDelay",
    label: "Cost of Delay",
    min: 0.5,
    max: 3,
    step: 0.25,
    hint: "Cost of not shipping this for one period. 0.5 low, 3 critical.",
  },
  {
    field: "jobSize",
    label: "Job Size",
    min: 0.5,
    max: 3,
    step: 0.25,
    hint: "How big the work is. Smaller jobs score higher.",
  },
]

/**
 * The evidence slots follow the model, which is shaped around the four inputs
 * teams argue about most. Cost of delay shares the impact slot and job size
 * shares the effort slot, so every scored input has somewhere to record its
 * provenance.
 */
const EVIDENCE_SLOT_BY_FIELD: Record<CriterionField, { key: keyof Evidence; label: string }> = {
  reach: { key: "reach", label: "Reach" },
  impact: { key: "impact", label: "Impact" },
  confidence: { key: "confidence", label: "Confidence" },
  effort: { key: "effort", label: "Effort" },
  costOfDelay: { key: "impact", label: "Cost of Delay" },
  jobSize: { key: "effort", label: "Job Size" },
}

function evidenceSlots(specs: FieldSpec[]): { key: keyof Evidence; label: string }[] {
  const seen = new Set<keyof Evidence>()
  const slots: { key: keyof Evidence; label: string }[] = []
  for (const spec of specs) {
    const slot = EVIDENCE_SLOT_BY_FIELD[spec.field]
    if (seen.has(slot.key)) continue
    seen.add(slot.key)
    slots.push(slot)
  }
  return slots
}

/** Which numeric inputs are relevant for the current project. */
export function fieldsForProject(project: PrioritizationProject): FieldSpec[] {
  if (project.mode === "weighted") {
    const used = new Set<CriterionField>()
    for (const criterion of project.criteria) {
      const field = resolveCriterionField(criterion)
      if (field) used.add(field)
    }
    const base = RICE_FIELDS.filter((spec) => used.has(spec.field))
    const extras: FieldSpec[] = [
      {
        field: "costOfDelay",
        label: "Cost of Delay",
        min: 0.5,
        max: 3,
        step: 0.25,
        hint: "Cost of not shipping this for one period.",
      },
      {
        field: "jobSize",
        label: "Job Size",
        min: 0.5,
        max: 3,
        step: 0.25,
        hint: "How big the work is. Smaller jobs score higher.",
      },
    ]
    return [
      ...base,
      ...extras.filter((spec) => used.has(spec.field)),
    ]
  }
  if (project.framework === "ICE") return ICE_FIELDS
  if (project.framework === "WSJF") return WSJF_FIELDS
  return RICE_FIELDS
}

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function NumberField({
  id,
  label,
  unit,
  min,
  max,
  step,
  hint,
  value,
  onChange,
}: Omit<FieldSpec, "field"> & {
  id: string
  value: number
  onChange: (value: number) => void
}) {
  // The text is tracked locally so a half-typed value like "1." is not
  // rewritten mid-keystroke. The key forces a reset when the value changes
  // from outside this field.
  const [text, setText] = useState(String(value))

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-foreground/80">
        {label}
        {unit ? (
          <span className="font-normal text-muted-foreground"> ({unit})</span>
        ) : null}
      </Label>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={text}
        onChange={(event) => {
          const raw = event.target.value
          setText(raw)
          const parsed = Number.parseFloat(raw)
          if (!Number.isFinite(parsed)) return
          onChange(clampNumber(parsed, min, max))
        }}
        onBlur={() => {
          const parsed = Number.parseFloat(text)
          const next = clampNumber(Number.isFinite(parsed) ? parsed : min, min, max)
          setText(String(next))
          onChange(next)
        }}
        className="numeric-input h-9 text-sm"
      />
      <p className="text-[11px] leading-relaxed text-muted-foreground">{hint}</p>
    </div>
  )
}

export interface ScoreInputsProps {
  item: PrioritizationItem
  project: PrioritizationProject
  onChange: (item: PrioritizationItem) => void
  onDelete?: () => void
}

/**
 * Numeric inputs plus the provenance text for each number.
 *
 * Every numeric input clamps to a valid range as you type, so the score can
 * never go NaN or infinite.
 */
export function ScoreInputs({ item, project, onChange, onDelete }: ScoreInputsProps) {
  const baseId = useId()
  const specs = fieldsForProject(project)
  const slots = evidenceSlots(specs)

  function setNumber(field: CriterionField, value: number) {
    onChange({ ...item, [field]: value } as PrioritizationItem)
  }

  function setEvidence(key: keyof Evidence, text: string) {
    onChange({
      ...item,
      evidence: { ...item.evidence, [key]: text },
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${baseId}-name`} className="text-xs font-medium text-foreground/80">
          Feature name
        </Label>
        <Input
          id={`${baseId}-name`}
          value={item.name}
          onChange={(event) => onChange({ ...item, name: event.target.value })}
          placeholder="e.g. Offline mode"
          className="h-9 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${baseId}-description`} className="text-xs font-medium text-foreground/80">
          Description
          <span className="font-normal text-muted-foreground"> (optional)</span>
        </Label>
        <Textarea
          id={`${baseId}-description`}
          value={item.description}
          onChange={(event) => onChange({ ...item, description: event.target.value })}
          placeholder="One line on what this feature does and who it is for."
          rows={2}
          className="resize-none text-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {specs.map((spec) => (
          <NumberField
            key={spec.field}
            id={`${baseId}-${spec.field}`}
            label={spec.label}
            unit={spec.unit}
            min={spec.min}
            max={spec.max}
            step={spec.step}
            hint={spec.hint}
            value={item[spec.field] as unknown as number}
            onChange={(value) => setNumber(spec.field, value)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-2/60 p-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Evidence
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Record where each number came from. This is what turns a score into a decision you
            can defend in a planning review.
          </p>
        </div>

        {slots.map((slot) => (
          <div key={slot.key} className="flex flex-col gap-1.5">
            <Label
              htmlFor={`${baseId}-evidence-${slot.key}`}
              className="text-xs font-medium text-foreground/80"
            >
              {slot.label} evidence
              <span className="font-normal text-muted-foreground">
                {" "}
                - where did this number come from?
              </span>
            </Label>
            <Textarea
              id={`${baseId}-evidence-${slot.key}`}
              value={item.evidence[slot.key] ?? ""}
              onChange={(event) => setEvidence(slot.key, event.target.value)}
              placeholder={
                slot.key === "reach"
                  ? "412 votes from 1,180 users"
                  : slot.key === "confidence"
                    ? "Sales confirmed by 3 of 5 pilot accounts"
                    : "Built by the platform team, about 3 weeks"
              }
              rows={2}
              className="resize-none text-sm"
            />
          </div>
        ))}
      </div>

      {onDelete ? (
        <Button type="button" variant="ghost" size="sm" onClick={onDelete} className="self-start">
          <Trash2 className={cn("text-destructive")} />
          Delete feature
        </Button>
      ) : null}
    </div>
  )
}
