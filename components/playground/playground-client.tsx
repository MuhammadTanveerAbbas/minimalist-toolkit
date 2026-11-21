"use client"

import { useCallback, useEffect, useState } from "react"
import { Copy, KeyRound, Play, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import type { ProviderCatalog, ProviderModel, RunResult } from "@/lib/providers/registry"

interface RunRow {
  id: string
  left_provider: string
  left_model: string
  right_provider: string
  right_model: string
  left_prompt: string
  right_prompt: string
  left_output: string | null
  right_output: string | null
  left_error: string | null
  right_error: string | null
  left_latency_ms: number | null
  right_latency_ms: number | null
  left_total_tokens: number | null
  right_total_tokens: number | null
  left_cost_usd: number | null
  right_cost_usd: number | null
  created_at: string
}

interface SideState {
  provider: string
  model: string
  prompt: string
}

const EMPTY_SIDE: SideState = { provider: "", model: "", prompt: "" }

function formatCost(value: number | null): string {
  if (value == null) return "Not published"
  return `$${value.toFixed(6)}`
}

function formatTokens(value: number | null): string {
  if (value == null) return "—"
  return value.toLocaleString()
}

function formatLatency(value: number | null): string {
  if (value == null) return "—"
  return `${value} ms`
}

function providerModels(providers: ProviderCatalog[], id: string): ProviderModel[] {
  return providers.find((provider) => provider.id === id)?.models ?? []
}

function configuredProviders(providers: ProviderCatalog[]): ProviderCatalog[] {
  return providers.filter((provider) => provider.configured)
}

export function PlaygroundClient() {
  const [providers, setProviders] = useState<ProviderCatalog[]>([])
  const [loadingProviders, setLoadingProviders] = useState(true)
  const [allModels, setAllModels] = useState(false)

  const [system, setSystem] = useState("")
  const [keys, setKeys] = useState<{ groq: string; openrouter: string }>({ groq: "", openrouter: "" })
  const [left, setLeft] = useState<SideState>(EMPTY_SIDE)
  const [right, setRight] = useState<SideState>(EMPTY_SIDE)

  const [leftResult, setLeftResult] = useState<RunResult | null>(null)
  const [rightResult, setRightResult] = useState<RunResult | null>(null)
  const [running, setRunning] = useState(false)
  const [runError, setRunError] = useState<string | null>(null)

  const [recentRuns, setRecentRuns] = useState<RunRow[]>([])
  const [runsUnavailable, setRunsUnavailable] = useState(false)
  const [loadingRuns, setLoadingRuns] = useState(true)

  const [copied, setCopied] = useState<"left" | "right" | null>(null)

  const loadProviders = useCallback(async (all: boolean, activeKeys: typeof keys) => {
    setLoadingProviders(true)
    try {
      const response = await fetch("/api/providers/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          all,
          keys: {
            groq: activeKeys.groq.trim() || undefined,
            openrouter: activeKeys.openrouter.trim() || undefined,
          },
        }),
      })
      const json = await response.json()
      setProviders(Array.isArray(json?.providers) ? json.providers : [])
    } catch {
      setProviders([])
    } finally {
      setLoadingProviders(false)
    }
  }, [])

  const loadRuns = useCallback(async () => {
    setLoadingRuns(true)
    try {
      const response = await fetch("/api/playground/runs")
      const json = await response.json()
      setRecentRuns(Array.isArray(json?.runs) ? json.runs : [])
      setRunsUnavailable(Boolean(json?.unavailable))
    } catch {
      setRunsUnavailable(true)
    } finally {
      setLoadingRuns(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => loadProviders(allModels, keys), 400)
    return () => window.clearTimeout(timer)
  }, [allModels, keys, loadProviders])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRuns()
  }, [loadRuns])

  useEffect(() => {
    const configured = configuredProviders(providers)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLeft((state) => {
      if (state.provider && providers.some((provider) => provider.id === state.provider)) {
        const models = providerModels(providers, state.provider)
        if (models.length && (!state.model || !models.some((model) => model.id === state.model))) {
          return { ...state, model: models[0].id }
        }
        return state
      }
      const nextProvider = configured[0]?.id ?? providers[0]?.id ?? "groq"
      const models = providerModels(providers, nextProvider)
      return { ...state, provider: nextProvider, model: models[0]?.id ?? "" }
    })
    setRight((state) => {
      if (state.provider && providers.some((provider) => provider.id === state.provider)) {
        const models = providerModels(providers, state.provider)
        if (models.length && (!state.model || !models.some((model) => model.id === state.model))) {
          return { ...state, model: models[0].id }
        }
        return state
      }
      const nextProvider = configured[1]?.id ?? configured[0]?.id ?? providers[0]?.id ?? "groq"
      const models = providerModels(providers, nextProvider)
      return { ...state, provider: nextProvider, model: models[0]?.id ?? "" }
    })
  }, [providers])

  const runComparison = useCallback(async () => {
    if (!left.prompt.trim() || !right.prompt.trim()) return
    setRunning(true)
    setRunError(null)
    setLeftResult(null)
    setRightResult(null)
    try {
      const response = await fetch("/api/playground/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: system.trim() || undefined,
          left: { provider: left.provider, model: left.model, prompt: left.prompt },
          right: { provider: right.provider, model: right.model, prompt: right.prompt },
          keys: {
            groq: keys.groq.trim() || undefined,
            openrouter: keys.openrouter.trim() || undefined,
          },
        }),
      })
      const json = await response.json()
      if (!response.ok) {
        const message = typeof json?.error === "string" ? json.error : "The comparison failed."
        setRunError(message)
        setLeftResult({ ok: false, error: message, latencyMs: null })
        setRightResult({ ok: false, error: message, latencyMs: null })
        return
      }
      setLeftResult(json.left ?? null)
      setRightResult(json.right ?? null)
      if (json.saved) loadRuns()
    } catch {
      const message = "Network error. Try again."
      setRunError(message)
      setLeftResult({ ok: false, error: message, latencyMs: null })
      setRightResult({ ok: false, error: message, latencyMs: null })
    } finally {
      setRunning(false)
    }
  }, [left, right, system, keys, loadRuns])

  const copyText = useCallback(async (side: "left" | "right", text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(side)
      window.setTimeout(() => setCopied(null), 1500)
    } catch {
      // Clipboard may be unavailable; ignore silently.
    }
  }, [])

  const restoreRun = useCallback((run: RunRow) => {
    setLeft({ provider: run.left_provider, model: run.left_model, prompt: run.left_prompt })
    setRight({ provider: run.right_provider, model: run.right_model, prompt: run.right_prompt })
    setLeftResult(
      run.left_output != null
        ? { ok: true, text: run.left_output, latencyMs: run.left_latency_ms, promptTokens: null, completionTokens: null, totalTokens: run.left_total_tokens, costUsd: run.left_cost_usd }
        : run.left_error
          ? { ok: false, error: run.left_error, latencyMs: run.left_latency_ms }
          : null
    )
    setRightResult(
      run.right_output != null
        ? { ok: true, text: run.right_output, latencyMs: run.right_latency_ms, promptTokens: null, completionTokens: null, totalTokens: run.right_total_tokens, costUsd: run.right_cost_usd }
        : run.right_error
          ? { ok: false, error: run.right_error, latencyMs: run.right_latency_ms }
          : null
    )
  }, [])

  const deleteRun = useCallback(async (id: string) => {
    await fetch(`/api/playground/runs?id=${encodeURIComponent(id)}`, { method: "DELETE" })
    setRecentRuns((current) => current.filter((run) => run.id !== id))
  }, [])

  const leftProvider = providers.find((provider) => provider.id === left.provider)
  const rightProvider = providers.find((provider) => provider.id === right.provider)
  const leftModels = providerModels(providers, left.provider)
  const rightModels = providerModels(providers, right.provider)

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl tracking-tight">AI Playground</h1>
        <p className="text-sm text-muted-foreground">
          Run two prompts against two models and compare answers, latency, tokens and cost.
        </p>
      </div>

      <div className="mt-6 grid items-start gap-4 lg:grid-cols-2">
        <Card className="self-start">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              Your API keys
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="groq-key">Groq key (optional)</Label>
              <Input
                id="groq-key"
                type="password"
                autoComplete="off"
                spellCheck={false}
                value={keys.groq}
                onChange={(event) => setKeys((current) => ({ ...current, groq: event.target.value }))}
                placeholder="gsk_..."
                maxLength={300}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="openrouter-key">OpenRouter key (optional)</Label>
              <Input
                id="openrouter-key"
                type="password"
                autoComplete="off"
                spellCheck={false}
                value={keys.openrouter}
                onChange={(event) => setKeys((current) => ({ ...current, openrouter: event.target.value }))}
                placeholder="sk-or-..."
                maxLength={300}
              />
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              Leave blank to use the workspace keys. Your keys are sent to the server for each request,
              used once, and never stored. Own keys skip the shared daily run budget.
            </p>
          </CardContent>
        </Card>

        <Card className="self-start">
          <CardContent className="flex flex-col gap-3 p-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="system-prompt">System prompt (optional)</Label>
              <Textarea
                id="system-prompt"
                value={system}
                onChange={(event) => setSystem(event.target.value)}
                placeholder="You are a helpful assistant."
                rows={3}
                maxLength={4000}
                className="h-20 resize-none"
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="all-models"
                  checked={allModels}
                  onCheckedChange={(checked) => setAllModels(checked === true)}
                />
                <Label htmlFor="all-models" className="text-sm font-normal">
                  Show all OpenRouter models
                </Label>
              </div>
              <Button onClick={runComparison} disabled={running || !left.prompt.trim() || !right.prompt.trim()}>
                <Play className="h-4 w-4" aria-hidden="true" />
                {running ? "Running..." : "Run comparison"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {runError ? (
        <Alert className="mt-4">
          <AlertDescription>{runError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <SidePanel
          title="Model A"
          side="left"
          state={left}
          setState={setLeft}
          providers={providers}
          loadingProviders={loadingProviders}
          models={leftModels}
          provider={leftProvider}
          result={leftResult}
          running={running}
          copied={copied === "left"}
          onCopy={(text) => copyText("left", text)}
        />
        <SidePanel
          title="Model B"
          side="right"
          state={right}
          setState={setRight}
          providers={providers}
          loadingProviders={loadingProviders}
          models={rightModels}
          provider={rightProvider}
          result={rightResult}
          running={running}
          copied={copied === "right"}
          onCopy={(text) => copyText("right", text)}
        />
      </div>

      <Separator className="my-8" />

      <section aria-labelledby="recent-runs-heading">
        <div className="flex items-center justify-between gap-2">
          <h2 id="recent-runs-heading" className="text-base font-medium">
            Recent runs
          </h2>
          <p className="text-xs text-muted-foreground">Saved to your account</p>
        </div>

        {loadingRuns ? (
          <div className="mt-3 flex flex-col gap-2" role="status" aria-label="Loading saved runs">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : runsUnavailable ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Runs are not available right now. The comparison above still works.
          </p>
        ) : recentRuns.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No saved runs yet. Run a comparison to create one.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {recentRuns.map((run) => (
              <li key={run.id}>
                <Card>
                  <CardContent className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {run.left_model} vs {run.right_model}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {new Date(run.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button variant="outline" size="sm" onClick={() => restoreRun(run)}>
                        Load
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRun(run.id)}
                        aria-label="Delete run"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

interface SidePanelProps {
  title: string
  side: "left" | "right"
  state: SideState
  setState: (updater: (current: SideState) => SideState) => void
  providers: ProviderCatalog[]
  loadingProviders: boolean
  models: ProviderModel[]
  provider: ProviderCatalog | undefined
  result: RunResult | null
  running: boolean
  copied: boolean
  onCopy: (text: string) => void
}

function SidePanel({
  title,
  side,
  state,
  setState,
  providers,
  loadingProviders,
  models,
  provider,
  result,
  running,
  copied,
  onCopy,
}: SidePanelProps) {
  const notConfigured = provider ? !provider.configured : false

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${side}-provider`}>Provider</Label>
            <Select
              value={state.provider}
              onValueChange={(value) => setState((current) => ({ ...current, provider: value, model: "" }))}
              disabled={loadingProviders}
            >
              <SelectTrigger id={`${side}-provider`}>
                <SelectValue placeholder={loadingProviders ? "Loading..." : "Select provider"} />
              </SelectTrigger>
              <SelectContent>
                {providers.map((entry) => (
                  <SelectItem key={entry.id} value={entry.id} disabled={!entry.configured}>
                    {entry.name}
                    {!entry.configured ? " (not configured)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${side}-model`}>Model</Label>
            <Select
              value={state.model}
              onValueChange={(value) => setState((current) => ({ ...current, model: value }))}
              disabled={loadingProviders || notConfigured || models.length === 0}
            >
              <SelectTrigger id={`${side}-model`}>
                <SelectValue placeholder={loadingProviders ? "Loading..." : "Select model"} />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {notConfigured ? (
          <p className="text-xs text-muted-foreground">
            Add your key above or set {state.provider === "groq" ? "GROQ_API_KEY" : "OPENROUTER_API_KEY"} in .env.local to use this provider.
          </p>
        ) : null}

        {provider?.error ? (
          <Alert>
            <AlertDescription>{provider.error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${side}-prompt`}>Prompt</Label>
          <Textarea
            id={`${side}-prompt`}
            value={state.prompt}
            onChange={(event) => setState((current) => ({ ...current, prompt: event.target.value }))}
            placeholder="Ask something..."
            rows={6}
            maxLength={8000}
            className="h-40 resize-none"
          />
          <p className="text-right text-xs text-muted-foreground">{state.prompt.length} / 8000</p>
        </div>

        <div aria-live="polite" className="flex flex-1 flex-col gap-3">
          {running && !result ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : null}

          {result ? (
            <div className="flex flex-col gap-3">
              {result.ok ? (
                <>
                  <div className="relative rounded-md border border-border bg-surface-2 p-3">
                    <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6">
                      {result.text}
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={() => onCopy(result.text)}
                      aria-label="Copy answer"
                    >
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <Metric label="Latency" value={formatLatency(result.latencyMs)} />
                    <Metric label="Tokens" value={formatTokens(result.totalTokens)} />
                    <Metric label="Cost" value={formatCost(result.costUsd)} />
                  </div>
                </>
              ) : (
                <Alert>
                  <AlertDescription>{result.error}</AlertDescription>
                </Alert>
              )}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-mono text-xs tabular-nums">{value}</p>
    </div>
  )
}
