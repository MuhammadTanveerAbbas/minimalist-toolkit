"use client"

import { useState } from "react"
import {
  Loader2,
  Sparkles,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  Maximize2,
  Monitor,
  Lock,
  Unlock,
  Dices,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ImageModel, MODEL_OPTIONS, QUALITY_SUPPORT, SIZE_OPTIONS, SIZE_SUPPORT, Quality, SizeValue } from "@/lib/mockify/generate-image"

const MAX_CHARS = 1000

interface PromptPreset {
  label: string
  prompt: string
}

/**
 * Concrete starters. Each one is a complete prompt with a subject, a
 * composition, a light source and a style, so the user edits a working
 * prompt instead of a fragment.
 */
const PROMPT_PRESETS: PromptPreset[] = [
  {
    label: "SaaS landing hero",
    prompt:
      "Wide hero banner for a B2B analytics dashboard: a clean product interface mockup floating at a slight angle, soft off-white background, screen-lit rim lighting from the left, generous negative space on the left for headline copy, photorealistic 3D render, high detail, full frame, no cropping",
  },
  {
    label: "Mobile app icon",
    prompt:
      "Single mobile app icon centered on a flat square canvas: a rounded-square glyph of a lightning bolt inside a circle, electric blue and warm orange flat colors, soft studio light from the top left, crisp vector-like edges, no text, generous padding, centered composition",
  },
  {
    label: "Product shot on marble",
    prompt:
      "Studio product photograph of an unbranded matte black portable speaker standing on a pale marble slab, three-quarter camera angle, soft diffused overhead lighting with gentle reflections, shallow depth of field, editorial product photography, full object visible, no cropping",
  },
  {
    label: "Isometric illustration",
    prompt:
      "Isometric cutaway illustration of a small warehouse automation system: conveyor belt, robotic arm and stacked crates, 45-degree top-down view, soft ambient occlusion, muted blue and warm grey palette, clean vector style, plain white background, full scene in frame",
  },
  {
    label: "Editorial portrait",
    prompt:
      "Editorial portrait of a confident software engineer in her thirties, natural window light from camera left, shallow depth of field, neutral studio background, subtle film grain, muted color grade, waist-up framing, looking slightly off camera, realistic skin tones",
  },
]

interface PromptFormProps {
  onGenerate: (prompt: string, size: SizeValue) => void
  isLoading: boolean
  model: ImageModel
  quality: Quality
  size: SizeValue
  onModelChange: (model: ImageModel) => void
  onQualityChange: (quality: Quality) => void
  onSizeChange: (size: SizeValue) => void
  seedLocked: boolean
  seedValue: number
  onSeedLockToggle: () => void
  onSeedChange: (seed: number) => void
  onRandomSeed: () => void
}

export function PromptForm({
  onGenerate,
  isLoading,
  model,
  quality,
  size,
  onModelChange,
  onQualityChange,
  onSizeChange,
  seedLocked,
  seedValue,
  onSeedLockToggle,
  onSeedChange,
  onRandomSeed,
}: PromptFormProps) {
  const [prompt, setPrompt] = useState("")
  const [promptError, setPromptError] = useState<string | null>(null)

  const qualityOptions = QUALITY_SUPPORT[model] ?? null
  // Models without explicit size restrictions support every size
  const sizeOptions = SIZE_SUPPORT[model] ?? SIZE_OPTIONS.map((s) => s.value)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) {
      setPromptError("Please enter a prompt.")
      return
    }
    setPromptError(null)
    onGenerate(prompt, size)
  }

  // Icon mapping
  const iconMap: Record<string, LucideIcon> = {
    Square,
    RectangleHorizontal,
    RectangleVertical,
    Maximize2,
    Monitor,
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Prompt presets */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
          Prompt presets
        </span>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Prompt presets">
          {PROMPT_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setPrompt(preset.prompt)
                setPromptError(null)
              }}
              className={cn(
                "min-h-9 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground",
                "hover:border-ring hover:text-foreground transition-colors font-mono",
                prompt === preset.prompt && "border-ring text-foreground"
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground/70">
          Presets fill the box with a complete prompt. Edit it before generating.
        </p>
      </div>

      {/* Prompt Textarea */}
      <div className="relative">
        <label htmlFor="mockify-prompt" className="sr-only">
          Image prompt
        </label>
        <textarea
          id="mockify-prompt"
          value={prompt}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHARS) setPrompt(e.target.value)
            if (promptError && e.target.value.trim()) setPromptError(null)
          }}
          placeholder="Describe the image in detail: subject, composition, lighting, style..."
          rows={4}
          className={cn(
            "w-full resize-none rounded-lg border bg-muted px-4 py-3 pb-6",
            "h-32 font-sans text-sm text-foreground placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-colors leading-relaxed",
            promptError ? "border-destructive" : "border-border"
          )}
        />
        <span className="absolute bottom-2 right-3 text-[10px] font-mono text-muted-foreground/60">
          {prompt.length}/{MAX_CHARS}
        </span>
        {promptError && (
          <p className="mt-1 text-xs text-destructive font-mono">{promptError}</p>
        )}
      </div>

      {/* Model + Quality + Size selectors */}
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1 flex-1 min-w-[180px]">
          <label
            htmlFor="mockify-model"
            className="text-xs font-mono text-muted-foreground uppercase tracking-widest"
          >
            Model
          </label>
          <select
            id="mockify-model"
            value={model}
            onChange={(e) => onModelChange(e.target.value as ImageModel)}
              className={cn(
                "rounded-lg border border-border bg-muted px-3 py-2",
                "text-sm text-foreground font-sans",
                "focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-colors"
              )}
            >
            {MODEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {MODEL_OPTIONS.find((opt) => opt.value === model)?.description && (
            <p className="text-xs text-muted-foreground/70 font-mono mt-0.5">
              {MODEL_OPTIONS.find((opt) => opt.value === model)?.description}
            </p>
          )}
        </div>

        {qualityOptions && (
          <div className="flex flex-col gap-1 min-w-[140px]">
            <label
              htmlFor="mockify-quality"
              className="text-xs font-mono text-muted-foreground uppercase tracking-widest"
            >
              Quality
            </label>
            <select
              id="mockify-quality"
              value={quality}
              onChange={(e) => onQualityChange(e.target.value as Quality)}
              className={cn(
                "rounded-lg border border-border bg-muted px-3 py-2",
                "text-sm text-foreground font-sans",
                "focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-colors"
              )}
            >
              {qualityOptions.map((q) => (
                <option key={q} value={q}>
                  {q.charAt(0).toUpperCase() + q.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Size/Aspect Ratio selector */}
      {sizeOptions && (
        <div className="flex flex-col gap-2">
          <span
            id="mockify-size-label"
            className="text-xs font-mono text-muted-foreground uppercase tracking-widest"
          >
            Size & Aspect Ratio
          </span>
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-2"
            role="group"
            aria-labelledby="mockify-size-label"
          >
            {SIZE_OPTIONS.filter(opt => sizeOptions.includes(opt.value)).map((opt) => {
              const IconComponent = iconMap[opt.icon]
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onSizeChange(opt.value)}
                  aria-pressed={size === opt.value}
                  className={cn(
                    "flex min-h-11 flex-col items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 transition-all",
                    size === opt.value
                      ? "border-ring bg-accent/10 text-foreground"
                      : "border-border bg-muted text-muted-foreground hover:border-ring/50 hover:text-foreground"
                  )}
                >
                  <IconComponent className="h-5 w-5" aria-hidden="true" />
                  <span className="text-xs font-medium">{opt.label}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{opt.ratio}</span>
                </button>
              )
            })}
          </div>
          <p className="text-xs text-muted-foreground/70 font-mono">
            Selected: {size}, full frame, no cropping
          </p>
        </div>
      )}

      {/* Seed control */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            id="mockify-seed-label"
            className="text-xs font-mono text-muted-foreground uppercase tracking-widest"
          >
            Seed
          </span>
          <button
            type="button"
            onClick={onSeedLockToggle}
            aria-pressed={seedLocked}
            className={cn(
              "inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-mono transition-colors",
              seedLocked
                ? "border-ring bg-accent/10 text-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {seedLocked ? (
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Unlock className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {seedLocked ? "Locked" : "Unlocked"}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="mockify-seed"
            type="number"
            inputMode="numeric"
            min={0}
            max={999999999}
            step={1}
            value={seedValue}
            disabled={!seedLocked}
            onChange={(e) => {
              const next = Number(e.target.value)
              if (Number.isFinite(next)) onSeedChange(next)
            }}
            aria-labelledby="mockify-seed-label"
            className={cn(
              "numeric-input w-full rounded-lg border border-border bg-muted px-3 py-2 font-mono text-sm text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-colors",
              !seedLocked && "opacity-50"
            )}
          />
          <button
            type="button"
            onClick={onRandomSeed}
            aria-label="Pick a random seed"
            title="Pick a random seed"
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground"
          >
            <Dices className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground/70 font-mono">
          {seedLocked
            ? "Same prompt and seed reproduce the same image."
            : "Unlocked: every generation uses a new random seed."}
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className={cn(
          "flex min-h-12 w-full items-center justify-center gap-2 rounded-lg px-8 py-3.5",
          "bg-foreground text-background font-sans text-sm font-semibold tracking-wide",
          "transition-opacity duration-150 hover:opacity-90 active:opacity-80",
          "disabled:cursor-not-allowed disabled:opacity-40"
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Generate Image
          </>
        )}
      </button>
    </form>
  )
}
