"use client"

import { useState, useCallback, useRef, useEffect, Component, type ReactNode } from "react"
import { PromptForm } from "@/components/mockify/prompt-form"
import { MockupResult } from "@/components/mockify/mockup-result"
import { EmptyState } from "@/components/mockify/empty-state"
import { PromptHistory } from "@/components/mockify/prompt-history"
import { WaveLoader } from "@/components/mockify/wave-loader"
import { useLocalStorageItem } from "@/lib/mockify/use-local-storage"
import { useMockifyHistory, type HistoryItem } from "@/lib/mockify/history"
import { Clock, X, CloudOff, Cloud } from "lucide-react"
import {
  generateImage,
  normalizeModel,
  normalizeSize,
  randomSeed,
  ImageModel,
  Quality,
  SizeValue,
  QUALITY_SUPPORT,
  SIZE_SUPPORT,
  type GenerateImageOptions,
} from "@/lib/mockify/generate-image"

const SETTINGS_KEY = "mockify_settings"

interface MockupData {
  imageUrl: string
  prompt: string
  seed: number
}

interface AppSettings {
  model: ImageModel
  quality: Quality
  size: SizeValue
  seedLocked: boolean
  seed: number
}

const DEFAULT_SETTINGS: AppSettings = {
  model: "auto",
  quality: "medium",
  size: "square",
  seedLocked: false,
  seed: 123456789,
}

async function persistableImageUrl(url: string): Promise<string> {
  if (!url.startsWith("blob:")) return url
  const response = await fetch(url)
  const blob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function parseSettings(raw: string): AppSettings {
  const parsed = JSON.parse(raw) as Partial<AppSettings>
  // normalizeModel/normalizeSize migrate legacy IDs and reject unknown values
  const model = normalizeModel(parsed.model)
  const size = normalizeSize(parsed.size)
  const allowedSizes = SIZE_SUPPORT[model]
  const safeSize = allowedSizes && !allowedSizes.includes(size) ? "square" : size
  const supportedQualities = QUALITY_SUPPORT[model]
  const quality =
    supportedQualities && !supportedQualities.includes(parsed.quality as Quality)
      ? DEFAULT_SETTINGS.quality
      : (parsed.quality ?? DEFAULT_SETTINGS.quality)
  const seed =
    typeof parsed.seed === "number" && Number.isFinite(parsed.seed)
      ? Math.min(999_999_999, Math.max(0, Math.round(parsed.seed)))
      : DEFAULT_SETTINGS.seed
  return {
    model,
    quality,
    size: safeSize,
    seedLocked: parsed.seedLocked ?? DEFAULT_SETTINGS.seedLocked,
    seed,
  }
}

/** Turns a raw failure into a named cause plus a concrete next step. */
function describeError(message: string): { cause: string; hint: string } {
  const lower = message.toLowerCase()
  if (lower.includes("busy") || lower.includes("rate limit") || lower.includes("too many")) {
    return {
      cause: "The free image service is rate limiting requests.",
      hint: "Wait about 15 seconds, then retry. Switching to Turbo also helps.",
    }
  }
  if (lower.includes("timed out") || lower.includes("timeout")) {
    return {
      cause: "The image service timed out before it finished.",
      hint: "Try again, or use Turbo for a faster response.",
    }
  }
  if (lower.includes("failed to load")) {
    return {
      cause: "The service returned an image that could not be decoded.",
      hint: "Try again, or switch models.",
    }
  }
  if (lower.includes("unauthorized") || lower.includes("401")) {
    return {
      cause: "Your session is no longer valid.",
      hint: "Sign in again and retry.",
    }
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return {
      cause: "The request never reached the image service.",
      hint: "Check your connection and retry.",
    }
  }
  return {
    cause: message,
    hint: "Try again, or switch models.",
  }
}

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <p className="text-sm font-medium text-foreground">Something went wrong.</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="min-h-11 rounded-lg border border-border px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export function MockifyTool() {
  const [current, setCurrent] = useState<MockupData | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [settings, setSettings] = useLocalStorageItem(
    SETTINGS_KEY,
    DEFAULT_SETTINGS,
    parseSettings,
    JSON.stringify
  )
  const { model, quality, size, seedLocked, seed } = settings

  const lastAttempt = useRef<{ prompt: string; size: SizeValue; seed: number } | null>(null)
  const [canRetry, setCanRetry] = useState(false)
  const promptInputRef = useRef<HTMLTextAreaElement | null>(null)

  const history = useMockifyHistory()
  const { items, add, remove, clear, isLoading: isHistoryLoading, mode } = history

  // Keep the ref pointing at the textarea so the empty state can focus it.
  useEffect(() => {
    promptInputRef.current = document.getElementById("mockify-prompt") as HTMLTextAreaElement | null
  }, [])

  const setModel = useCallback(
    (next: ImageModel) =>
      setSettings((prev) => {
        // Keep quality/size valid for the newly selected model
        const supportedQualities = QUALITY_SUPPORT[next]
        const quality =
          supportedQualities && !supportedQualities.includes(prev.quality)
            ? DEFAULT_SETTINGS.quality
            : prev.quality
        const allowedSizes = SIZE_SUPPORT[next]
        const size = allowedSizes && !allowedSizes.includes(prev.size) ? "square" : prev.size
        return { ...prev, model: next, quality, size }
      }),
    [setSettings]
  )
  const setQuality = useCallback(
    (next: Quality) => setSettings((prev) => ({ ...prev, quality: next })),
    [setSettings]
  )
  const setSize = useCallback(
    (next: SizeValue) => setSettings((prev) => ({ ...prev, size: next })),
    [setSettings]
  )
  const toggleSeedLock = useCallback(
    () => setSettings((prev) => ({ ...prev, seedLocked: !prev.seedLocked })),
    [setSettings]
  )
  const setSeedValue = useCallback(
    (next: number) => setSettings((prev) => ({ ...prev, seed: next })),
    [setSettings]
  )
  const pickRandomSeed = useCallback(
    () => setSettings((prev) => ({ ...prev, seed: randomSeed() })),
    [setSettings]
  )

  const runGeneration = useCallback(
    async (prompt: string, selectedSize: SizeValue, seedToUse: number) => {
      setIsLoading(true)
      setError(null)
      lastAttempt.current = { prompt, size: selectedSize, seed: seedToUse }
      setCanRetry(true)

      try {
        const opts: GenerateImageOptions = { model, size: selectedSize, seed: seedToUse }
        // generateImage only sends quality when the model supports it
        if (QUALITY_SUPPORT[model]) {
          opts.quality = quality
        }

        const imageUrl = await generateImage(prompt, opts)
        const storableUrl = await persistableImageUrl(imageUrl)
        setCurrent({ imageUrl: storableUrl, prompt, seed: seedToUse })

        await add({
          id: crypto.randomUUID(),
          prompt,
          model,
          size: selectedSize,
          imageUrl: storableUrl,
          timestamp: new Date(),
        })
      } catch (err) {
        let msg = "Image generation failed. Please try again or switch models."
        if (err instanceof Error) {
          msg = err.message
        } else if (err && typeof err === "object") {
          const e = err as Record<string, unknown>
          msg = (e.message as string) || (e.error as string) || JSON.stringify(err)
        }
        setError(msg)
      } finally {
        setIsLoading(false)
      }
    },
    [add, model, quality]
  )

  const handleGenerate = useCallback(
    async (prompt: string, selectedSize: SizeValue) => {
      if (!prompt.trim()) {
        setError("Please enter a prompt.")
        return
      }
      const seedToUse = seedLocked ? seed : randomSeed()
      await runGeneration(prompt, selectedSize, seedToUse)
    },
    [runGeneration, seed, seedLocked]
  )

  const handleNewVariation = useCallback(async () => {
    if (!current) return
    // A variation keeps the prompt but draws a fresh random seed.
    await runGeneration(current.prompt, normalizeSize(size), randomSeed())
  }, [current, runGeneration, size])

  const handleSelectHistory = (item: HistoryItem) => {
    if (!item.imageUrl) {
      setError("That generation has no image in this browser. Only its prompt was saved.")
      setShowHistory(false)
      return
    }
    setCurrent({ imageUrl: item.imageUrl, prompt: item.prompt, seed: 0 })
    setModel(normalizeModel(item.model))
    setShowHistory(false)
  }

  const handleDeleteHistory = (id: string) => {
    void remove(id)
  }

  const handleClearHistory = () => void clear()

  const focusPrompt = () => {
    const el = document.getElementById("mockify-prompt") as HTMLTextAreaElement | null
    el?.focus()
    el?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  const errorInfo = error ? describeError(error) : null

  return (
    <div className="font-sans">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Describe an idea and generate an image.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          aria-expanded={showHistory}
          className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showHistory ? (
            <>
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Close
            </>
          ) : (
            <>
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              History
              {items.length > 0 ? (
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px]">{items.length}</span>
              ) : null}
            </>
          )}
        </button>
      </div>

      <div className="mx-auto max-w-3xl w-full">
        {showHistory ? (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-foreground">Generation History</h2>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  {mode === "database" ? (
                    <>
                      <Cloud className="h-3 w-3" aria-hidden="true" />
                      Saved to your account
                    </>
                  ) : (
                    <>
                      <CloudOff className="h-3 w-3" aria-hidden="true" />
                      Saved in this browser only
                    </>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="inline-flex h-9 shrink-0 items-center rounded-lg border border-border px-3 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
              >
                Back
              </button>
            </div>
            {isHistoryLoading ? (
              <HistorySkeleton />
            ) : (
              <PromptHistory
                items={items}
                onSelect={handleSelectHistory}
                onDelete={handleDeleteHistory}
                onClearAll={handleClearHistory}
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-6 sm:gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {!current && !isLoading && (
              <div className="pt-6 pb-2 text-center sm:pt-10 sm:pb-4">
                <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                  Generate AI images
                  <span className="block font-normal text-muted-foreground">with Mockify</span>
                </h1>
                <p className="mx-auto mt-3 max-w-md px-2 text-sm leading-6 text-muted-foreground">
                  Describe a mockup, product, or scene and generate an image in your browser.
                  Powered by Pollinations.ai through the app proxy.
                </p>
              </div>
            )}

            <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <ErrorBoundary>
                <PromptForm
                  onGenerate={handleGenerate}
                  isLoading={isLoading}
                  model={model}
                  quality={quality}
                  size={size}
                  onModelChange={setModel}
                  onQualityChange={setQuality}
                  onSizeChange={setSize}
                  seedLocked={seedLocked}
                  seedValue={seed}
                  onSeedLockToggle={toggleSeedLock}
                  onSeedChange={setSeedValue}
                  onRandomSeed={pickRandomSeed}
                />
              </ErrorBoundary>
            </div>

            {error && errorInfo && (
              <div
                role="alert"
                className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-destructive-foreground">
                    {errorInfo.cause}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {errorInfo.hint}
                  </p>
                </div>
                {canRetry && !isLoading && (
                  <button
                    type="button"
                    onClick={() => {
                      if (lastAttempt.current)
                        void runGeneration(
                          lastAttempt.current.prompt,
                          lastAttempt.current.size,
                          lastAttempt.current.seed
                        )
                    }}
                    className="shrink-0 min-h-9 rounded-lg border border-destructive/40 px-3 py-1.5 text-xs text-foreground hover:bg-destructive/20 transition-colors"
                  >
                    Try again
                  </button>
                )}
              </div>
            )}

            {isLoading && <WaveLoader />}

            {current && !isLoading && (
              <MockupResult
                imageUrl={current.imageUrl}
                prompt={current.prompt}
                seed={current.seed || null}
                onNewVariation={handleNewVariation}
                isGenerating={isLoading}
              />
            )}

            {!current && !isLoading && !error && <EmptyState onStart={focusPrompt} />}
          </div>
        )}
      </div>
    </div>
  )
}

function HistorySkeleton() {
  return (
    <div className="flex flex-col gap-2.5" role="status" aria-label="Loading history">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-xl border border-border/80 bg-card p-4"
        >
          <div className="h-14 w-14 shrink-0 animate-shimmer rounded-lg bg-muted" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="h-3 w-2/3 animate-shimmer rounded bg-muted" />
            <div className="h-2.5 w-1/3 animate-shimmer rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}
