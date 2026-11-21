// Server-side access to the model providers used by the AI Playground.
// Server-only: never import this from a client component.
// OpenRouter is an OpenAI-compatible aggregator; Groq is the existing provider.

const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1"
const GROQ_API_BASE = "https://api.groq.com/openai/v1"

const NON_CHAT_MODEL_PATTERN = /whisper|tts|guard|embed|distil|playai/i

const OPEN_WEIGHT_PREFIXES = [
  "meta-llama/",
  "mistralai/",
  "qwen/",
  "deepseek/",
  "google/gemma",
  "microsoft/phi",
  "nvidia/nemotron",
  "allenai/",
  "tiiuae/",
  "openai/gpt-oss",
  "z-ai/glm",
  "moonshotai/kimi",
  "minimax/",
  "01-ai/",
  "huggingfaceh4/",
]

const CATALOG_CACHE_TTL_MS = 10 * 60 * 1000

export type ProviderId = "groq" | "openrouter"

export interface ProviderModel {
  id: string
  name: string
  contextLength: number | null
  promptPricePerToken: number | null
  completionPricePerToken: number | null
}

export interface ProviderCatalog {
  id: ProviderId
  name: string
  configured: boolean
  error: string | null
  models: ProviderModel[]
}

export interface RunInput {
  provider: ProviderId
  model: string
  prompt: string
  system?: string
  /** Optional user-supplied key. Used for this request only, never stored. */
  apiKey?: string
}

export type RunResult =
  | {
      ok: true
      text: string
      latencyMs: number | null
      promptTokens: number | null
      completionTokens: number | null
      totalTokens: number | null
      costUsd: number | null
    }
  | {
      ok: false
      error: string
      latencyMs: number | null
    }

interface CacheEntry {
  catalog: ProviderCatalog
  expiresAt: number
}

const catalogCache = new Map<string, CacheEntry>()

function isOpenWeight(id: string): boolean {
  const lower = id.toLowerCase()
  if (lower.includes(":online")) return false
  return OPEN_WEIGHT_PREFIXES.some((prefix) => lower.startsWith(prefix.toLowerCase()))
}

function isTextModel(model: unknown): boolean {
  const modalities = (model as { architecture?: { output_modalities?: unknown } })?.architecture?.output_modalities
  if (Array.isArray(modalities) && modalities.length > 0) {
    return modalities.includes("text")
  }
  return true
}

function humanizeUpstream(error: unknown, provider: string): string {
  if (error instanceof Error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return `${provider} did not respond in time.`
    }
    const match = /HTTP (\d+)/.exec(error.message)
    if (match) {
      const code = match[1]
      if (code === "401") return `${provider} rejected the API key.`
      if (code === "403") return `${provider} refused the request.`
      if (code === "429") return `${provider} is rate limiting. Try again shortly.`
      if (code.startsWith("5")) return `${provider} upstream error (${code}).`
      return `${provider} request failed (${code}).`
    }
  }
  return `${provider} request failed.`
}

async function fetchJson(url: string, init: RequestInit, timeoutMs: number): Promise<any> {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  return response.json()
}

async function loadGroq(userKey?: string): Promise<ProviderCatalog> {
  const key = userKey?.trim() || process.env.GROQ_API_KEY?.trim()
  if (!key) {
    return { id: "groq", name: "Groq", configured: false, error: null, models: [] }
  }

  const usesAppKey = key === process.env.GROQ_API_KEY?.trim()
  const cacheKey = "groq"
  const cached = catalogCache.get(cacheKey)
  if (usesAppKey && cached && cached.expiresAt > Date.now()) return cached.catalog

  try {
    const json = await fetchJson(
      `${GROQ_API_BASE}/models`,
      { headers: { Authorization: `Bearer ${key}` } },
      10_000
    )
    const data = Array.isArray(json?.data) ? json.data : []
    const models: ProviderModel[] = data
      .filter((model: any) => typeof model?.id === "string" && !NON_CHAT_MODEL_PATTERN.test(model.id))
      .map((model: any) => ({
        id: model.id,
        name: model.id,
        contextLength: typeof model.context_window === "number" ? model.context_window : null,
        promptPricePerToken: null,
        completionPricePerToken: null,
      }))
      .sort((a: ProviderModel, b: ProviderModel) => a.id.localeCompare(b.id))

    const catalog: ProviderCatalog = { id: "groq", name: "Groq", configured: true, error: null, models }
    if (usesAppKey) catalogCache.set(cacheKey, { catalog, expiresAt: Date.now() + CATALOG_CACHE_TTL_MS })
    return catalog
  } catch (error) {
    return { id: "groq", name: "Groq", configured: true, error: humanizeUpstream(error, "Groq"), models: [] }
  }
}

async function loadOpenRouter(all: boolean, userKey?: string): Promise<ProviderCatalog> {
  const key = userKey?.trim() || process.env.OPENROUTER_API_KEY?.trim()
  if (!key) {
    return { id: "openrouter", name: "OpenRouter", configured: false, error: null, models: [] }
  }

  const usesAppKey = key === process.env.OPENROUTER_API_KEY?.trim()
  const cacheKey = `openrouter:${all ? "all" : "filtered"}`
  const cached = catalogCache.get(cacheKey)
  if (usesAppKey && cached && cached.expiresAt > Date.now()) return cached.catalog

  try {
    const json = await fetchJson(
      `${OPENROUTER_API_BASE}/models`,
      { headers: { Authorization: `Bearer ${key}` } },
      10_000
    )
    const data = Array.isArray(json?.data) ? json.data : []
    const models: ProviderModel[] = data
      .filter((model: any) => typeof model?.id === "string")
      .filter((model: any) => isTextModel(model))
      .filter((model: any) => (all ? true : isOpenWeight(model.id)))
      .map((model: any) => {
        const pricing = model?.pricing ?? {}
        const prompt = Number(pricing.prompt)
        const completion = Number(pricing.completion)
        return {
          id: model.id,
          name: typeof model.name === "string" ? model.name : model.id,
          contextLength: typeof model.context_length === "number" ? model.context_length : null,
          promptPricePerToken: Number.isFinite(prompt) ? prompt : null,
          completionPricePerToken: Number.isFinite(completion) ? completion : null,
        }
      })
      .sort((a: ProviderModel, b: ProviderModel) => a.id.localeCompare(b.id))

    const catalog: ProviderCatalog = { id: "openrouter", name: "OpenRouter", configured: true, error: null, models }
    if (usesAppKey) catalogCache.set(cacheKey, { catalog, expiresAt: Date.now() + CATALOG_CACHE_TTL_MS })
    return catalog
  } catch (error) {
    return { id: "openrouter", name: "OpenRouter", configured: true, error: humanizeUpstream(error, "OpenRouter"), models: [] }
  }
}

export async function listProviders(options?: {
  all?: boolean
  keys?: Partial<Record<ProviderId, string>>
}): Promise<ProviderCatalog[]> {
  const all = options?.all === true
  const [groq, openrouter] = await Promise.all([
    loadGroq(options?.keys?.groq),
    loadOpenRouter(all, options?.keys?.openrouter),
  ])
  return [groq, openrouter]
}

export async function runModel(input: RunInput): Promise<RunResult> {
  const started = Date.now()
  const providerName = input.provider === "groq" ? "Groq" : "OpenRouter"
  const envKey = (input.provider === "groq" ? process.env.GROQ_API_KEY : process.env.OPENROUTER_API_KEY)?.trim()
  const userKey = input.apiKey?.trim()
  const key = userKey || envKey
  const usesUserKey = Boolean(userKey && userKey !== envKey)

  if (!key) {
    return {
      ok: false,
      error: `${providerName} is not configured. Add your key in the Playground or set ${input.provider === "groq" ? "GROQ_API_KEY" : "OPENROUTER_API_KEY"} in .env.local.`,
      latencyMs: null,
    }
  }

  const base = input.provider === "groq" ? GROQ_API_BASE : OPENROUTER_API_BASE
  const system = input.system?.trim()
  const messages = system
    ? [
        { role: "system", content: system },
        { role: "user", content: input.prompt },
      ]
    : [{ role: "user", content: input.prompt }]

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  }
  if (input.provider === "openrouter") {
    headers["HTTP-Referer"] = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000"
    headers["X-Title"] = "Minimalist Toolkit"
  }

  let response: Response
  try {
    response = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({ model: input.model, messages, max_tokens: 1024 }),
      signal: AbortSignal.timeout(45_000),
    })
  } catch (error) {
    const latencyMs = Date.now() - started
    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
      return { ok: false, error: "The request took too long.", latencyMs }
    }
    return { ok: false, error: "Network error. Try again.", latencyMs }
  }

  const latencyMs = Date.now() - started

  if (!response.ok) {
    let detail = ""
    try {
      const json = await response.json()
      detail = json?.error?.message ?? json?.message ?? ""
    } catch {
      // ignore
    }
    const code = response.status
    let message = `${providerName} request failed (${code}).`
    if (code === 401) message = `${providerName} rejected the API key.`
    else if (code === 402) message = `${providerName} needs credits.`
    else if (code === 404) message = `Model "${input.model}" is not available.`
    else if (code === 429) message = "Rate limited. Try again shortly."
    else if (code >= 500) message = "Upstream error. Try again."
    if (detail && detail.length < 200) message = `${message} ${detail}`
    return { ok: false, error: message.trim(), latencyMs }
  }

  let json: any
  try {
    json = await response.json()
  } catch {
    return { ok: false, error: "Invalid response from the provider.", latencyMs }
  }

  const text = json?.choices?.[0]?.message?.content
  if (typeof text !== "string") {
    return { ok: false, error: "The provider returned no text.", latencyMs }
  }

  const usage = json?.usage ?? {}
  const promptTokens = typeof usage.prompt_tokens === "number" ? usage.prompt_tokens : null
  const completionTokens = typeof usage.completion_tokens === "number" ? usage.completion_tokens : null
  const totalTokens =
    typeof usage.total_tokens === "number"
      ? usage.total_tokens
      : promptTokens != null && completionTokens != null
        ? promptTokens + completionTokens
        : null

  let costUsd: number | null = null
  if (input.provider === "openrouter") {
    try {
      const catalog = await loadOpenRouter(true, usesUserKey ? userKey : undefined)
      const model = catalog.models.find((entry) => entry.id === input.model)
      if (model && (model.promptPricePerToken != null || model.completionPricePerToken != null)) {
        costUsd =
          (promptTokens ?? 0) * (model.promptPricePerToken ?? 0) +
          (completionTokens ?? 0) * (model.completionPricePerToken ?? 0)
      }
    } catch {
      costUsd = null
    }
  }

  return { ok: true, text, latencyMs, promptTokens, completionTokens, totalTokens, costUsd }
}