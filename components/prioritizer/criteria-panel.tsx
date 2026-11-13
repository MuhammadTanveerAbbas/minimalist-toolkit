"use client"

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CHART_COLORS } from "@/components/charts"
import { cn } from "@/lib/utils"
import {
  FIELD_LABELS,
  defaultCriteria,
  normaliseWeights,
  resolveCriterionField,
} from "@/lib/prioritizer/scoring"
import type {
  Criterion,
  CriterionField,
  Framework,
  PrioritizationProject,
} from "@/lib/prioritizer/types"

const FRAMEWORK_OPTIONS: { value: Framework; label: string }[] = [
  { value: "RICE", label: "RICE" },
  { value: "ICE", label: "ICE" },
  { value: "WSJF", label: "WSJF" },
]

const FIELD_OPTIONS: CriterionField[] = [
  "reach",
  "impact",
  "confidence",
  "effort",
  "costOfDelay",
  "jobSize",
]

export interface CriteriaPanelProps {
  project: PrioritizationProject
  onChange: (next: PrioritizationProject) => void
}

/**
 * Framework and criteria editor.
 *
 * In a framework mode the criteria are read only: the formula is fixed and
 * the weights shown are the framework defaults. Switching to the custom
 * weighted mode unlocks the list, and any change to a weight redistributes
 * the rest so the split always adds up to 100 percent.
 */
export function CriteriaPanel({ project, onChange }: CriteriaPanelProps) {
  const normalised = normaliseWeights(project.criteria)
  const isWeighted = project.mode === "weighted"

  function selectFramework(framework: Framework) {
    onChange({
      ...project,
      framework,
      mode: "framework",
      criteria: defaultCriteria(framework),
    })
  }

  function selectWeighted() {
    onChange({
      ...project,
      mode: "weighted",
      criteria:
        project.criteria.length > 0 ? project.criteria : defaultCriteria(project.framework),
    })
  }

  function updateCriterion(index: number, patch: Partial<Criterion>) {
    const criteria = project.criteria.map((criterion, i) =>
      i === index ? { ...criterion, ...patch } : criterion
    )
    onChange({ ...project, criteria: normaliseWeights(criteria) })
  }

  function setWeight(index: number, weight: number) {
    const criteria = project.criteria.map((criterion, i) =>
      i === index ? { ...criterion, weight } : criterion
    )
    onChange({ ...project, criteria: normaliseWeights(criteria) })
  }

  function moveCriterion(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= project.criteria.length) return
    const criteria = [...project.criteria]
    const [moved] = criteria.splice(index, 1)
    criteria.splice(target, 0, moved)
    onChange({ ...project, criteria })
  }

  function removeCriterion(index: number) {
    const criteria = project.criteria.filter((_, i) => i !== index)
    onChange({ ...project, criteria: normaliseWeights(criteria) })
  }

  function addCriterion() {
    const used = new Set(
      project.criteria
        .map((criterion) => resolveCriterionField(criterion))
        .filter((field): field is CriterionField => field !== null)
    )
    const field = FIELD_OPTIONS.find((option) => !used.has(option)) ?? "reach"
    const criteria = [
      ...project.criteria,
      {
        id: `${field}-${Date.now().toString(36)}`,
        name: FIELD_LABELS[field],
        field,
        weight: 10,
        lowerIsBetter: field === "effort" || field === "jobSize",
        description: "",
      },
    ]
    onChange({ ...project, criteria: normaliseWeights(criteria) })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Scoring mode
        </p>
        <div
          className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted/40 p-1 sm:grid-cols-4"
          role="group"
          aria-label="Scoring mode"
        >
          {FRAMEWORK_OPTIONS.map((option) => {
            const active = project.mode === "framework" && project.framework === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => selectFramework(option.value)}
                aria-pressed={active}
                className={cn(
                  "min-h-11 rounded-md px-2 text-xs font-medium transition-colors md:min-h-9",
                  active
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            )
          })}
          <button
            type="button"
            onClick={selectWeighted}
            aria-pressed={isWeighted}
            className={cn(
              "col-span-2 min-h-11 rounded-md px-2 text-xs font-medium transition-colors sm:col-span-1 md:min-h-9",
              isWeighted
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Weighted
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {isWeighted ? "Custom weights" : "Framework weights"}
          </p>
          <p className="text-xs tabular-nums text-muted-foreground">Total 100%</p>
        </div>

        {normalised.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No criteria yet. Add one to score with custom weights.
          </p>
        ) : (
          <>
            <div
              className="flex h-2 w-full overflow-hidden rounded-full bg-muted"
              role="img"
              aria-label={normalised
                .map((criterion) => `${criterion.name} ${criterion.weight}%`)
                .join(", ")}
            >
              {normalised.map((criterion, index) => (
                <div
                  key={criterion.id}
                  className="h-full"
                  style={{
                    width: `${criterion.weight}%`,
                    backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                  }}
                />
              ))}
            </div>

            <ul className="flex flex-col gap-2">
              {normalised.map((criterion, index) => {
                const field = resolveCriterionField(criterion)
                return (
                  <li
                    key={criterion.id}
                    className="flex flex-col gap-2 rounded-lg border border-border bg-surface-2/60 p-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="size-2.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />
                      {isWeighted ? (
                        <Input
                          value={criterion.name}
                          onChange={(event) =>
                            updateCriterion(index, { name: event.target.value })
                          }
                          aria-label={`Criterion ${index + 1} name`}
                          className="h-11 min-w-0 flex-1 text-base md:h-8 md:text-xs"
                        />
                      ) : (
                        <span className="min-w-0 flex-1 truncate text-xs font-medium">
                          {criterion.name}
                        </span>
                      )}
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {criterion.weight.toFixed(1)}%
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`weight-${criterion.id}`}
                        className="shrink-0 text-[11px] font-normal text-muted-foreground"
                      >
                        Weight
                      </Label>
                      <Input
                        id={`weight-${criterion.id}`}
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={100}
                        step={1}
                        disabled={!isWeighted}
                        value={Number.isFinite(criterion.weight) ? criterion.weight : 0}
                        onChange={(event) => {
                          const parsed = Number.parseFloat(event.target.value)
                          if (!Number.isFinite(parsed)) return
                          setWeight(index, Math.min(100, Math.max(0, parsed)))
                        }}
                        className="numeric-input h-11 w-20 text-base md:h-8 md:text-xs"
                      />
                      <div className="min-w-0 flex-1">
                        {isWeighted ? (
                          <Select
                            value={field ?? "reach"}
                            onValueChange={(value) => {
                              const nextField = value as CriterionField
                              updateCriterion(index, {
                                field: nextField,
                                lowerIsBetter:
                                  nextField === "effort" || nextField === "jobSize",
                              })
                            }}
                          >
                            <SelectTrigger
                              className="h-11 w-full text-xs md:h-8"
                              aria-label={`Source input for ${criterion.name}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FIELD_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {FIELD_LABELS[option]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="block truncate text-[11px] text-muted-foreground">
                            {field ? FIELD_LABELS[field] : "No input linked"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="flex min-h-11 cursor-pointer items-center gap-2 text-[11px] text-muted-foreground md:min-h-8">
                        <Checkbox
                          checked={criterion.lowerIsBetter}
                          disabled={!isWeighted}
                          onCheckedChange={(checked) =>
                            updateCriterion(index, { lowerIsBetter: checked === true })
                          }
                          aria-label={`Lower is better for ${criterion.name}`}
                        />
                        Lower is better
                      </label>

                      {isWeighted ? (
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => moveCriterion(index, -1)}
                            disabled={index === 0}
                            aria-label={`Move ${criterion.name} up`}
                            className="h-11 w-11 md:h-8 md:w-8"
                          >
                            <ArrowUp />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => moveCriterion(index, 1)}
                            disabled={index === normalised.length - 1}
                            aria-label={`Move ${criterion.name} down`}
                            className="h-11 w-11 md:h-8 md:w-8"
                          >
                            <ArrowDown />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeCriterion(index)}
                            aria-label={`Remove ${criterion.name}`}
                            className="h-11 w-11 md:h-8 md:w-8"
                          >
                            <Trash2 className="text-destructive" />
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
        )}

        {isWeighted ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCriterion}
            className="min-h-11 md:min-h-8"
          >
            <Plus />
            Add criterion
          </Button>
        ) : (
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            These are the framework defaults. Choose Weighted to set your own weights.
          </p>
        )}
      </div>
    </div>
  )
}
