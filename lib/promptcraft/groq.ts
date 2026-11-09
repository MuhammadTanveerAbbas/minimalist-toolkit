// Server-side Groq access with model discovery, bounded retries,
// rate-limit handling, and automatic model fallback.
// Server-only: never import this from client components.

const GROQ_API_BASE = "https://api.groq.com/openai/v1"

const DEFAULT_MODEL = "llama-3.3-70b-versatile"
const MODEL_CACHE_TTL_MS = 10 * 60 * 1000
const MODEL_LIST_TIMEOUT_MS = 8_000
const CHAT_REQUEST_TIMEOUT_MS = 25_000
const OVERALL_DEADLINE_MS = 26_000
const MAX_RATE_LIMIT_RETRIES = 2
const MAX_TRANSIENT_RETRIES = 2
const MAX_MODEL_FALLBACKS = 1
const MAX_SLEEP_MS = 8_000

// Groq models that cannot serve chat completions.
const NON_CHAT_MODEL_PATTERN = /whisper|tts|guard|embed|distil|playai/i

export interface GroqMessage {
  role: "system" | "user" | "assistant"
  content: string
}

interface GroqChatOptions {
  messages: GroqMessage[]
  maxTokens?: number
}

type ErrorKind = "config" | "rate_limit" | "model_unavailable" | "timeout" | "upstream"

const CLIENT_ERRORS: Record<ErrorKind, { status: number; message: string }> = {
  config: { status: 500, message: "AI service is not configured." },
  rate_limit: {
    status: 429,
    message: "AI service is busy right now. Please try again in a moment.",
  },
  model_unavailable: {
    status: 503,
    message: "The AI model is temporarily unavailable. Please try again shortly.",
  },
  timeout: {
    status: 504,
    message: "The AI service took too long to respond. Please try again.",
  },
  upstream: {
    status: 502,
    message: "AI service is temporarily unavailable. Please try again.",
  },
}

function log(kind: string, detail: string) {
  console.error(`[groq] ${kind}: ${detail}`)
}

function logInfo(detail: string) {
  console.warn(`[groq] ${detail}`)
}

function truncate(text: string, max = 300): string {
  return text.length > max ? `${text.slice(0, max)}…` : text
}

function jsonError(kind: ErrorKind): Response {
  return Response.json(
    { error: CLIENT_ERRORS[kind].message },
    { status: CLIENT_ERRORS[kind].status }
  )
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function backoffDelay(attempt: number): number {
  const base = Math.min(4_000, 500 * 2 ** (attempt - 1))
  const jitter = base * 0.25 * (Math.random() * 2 - 1)
  return Math.max(100, Math.round(base + jitter))
}

function retryAfterDelay(header: string | null, attempt: number): number {
  if (header) {
    const seconds = Number(header)
    let ms = Number.isFinite(seconds)
      ? seconds * 1000
      : Date.parse(header) - Date.now()
    if (Number.isFinite(ms)) return Math.min(Math.max(Math.round(ms), 100), MAX_SLEEP_MS)
  }
  return backoffDelay(attempt)
}

function isTimeoutError(err: unknown): boolean {
  if (!(err instanceof Error)) return false
  return (
    err.name === "TimeoutError" ||
    err.name === "AbortError" ||
    /timed?\s?out/i.test(err.message)
  )
}

function isModelUnavailable(status: number, body: string): boolean {
  if (status === 404) return true
  if (status === 400 || status === 422) {
    return (
      /model/i.test(body) &&
      /(does not exist|not exist|not found|decommissioned|unsupported|invalid|retired)/i.test(body)
    )
  }
  return false
}

function kindForStatus(status: number): ErrorKind {
  if (status === 401 || status === 403) return "config"
  if (status >= 500) return "upstream"
  return "upstream"
}

// ── Model discovery ──────────────────────────────────────────────────────────

let modelCache: { ids: string[]; expiresAt: number } | null = null

/** Test helper: resets the cached model list. */
export function clearModelCache() {
  modelCache = null
}

async function getModelIds(apiKey: string, forceRefresh = false): Promise<string[]> {
  if (!forceRefresh && modelCache && Date.now() < modelCache.expiresAt) {
    return modelCache.ids
  }

  const res = await fetch(`${GROQ_API_BASE}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(MODEL_LIST_TIMEOUT_MS),
  })
  if (!res.ok) {
    throw new Error(`model list request failed (${res.status})`)
  }

  let data: unknown = null
  try {
    data = await res.json()
  } catch {
    throw new Error("model list response was malformed")
  }

  const list = (data as { data?: unknown } | null)?.data
  const ids = Array.isArray(list)
    ? list
        .map((entry) => (entry as { id?: unknown } | null)?.id)
        .filter((id): id is string => typeof id === "string")
    : []

  if (ids.length === 0) {
    throw new Error("model list was empty")
  }

  modelCache = { ids, expiresAt: Date.now() + MODEL_CACHE_TTL_MS }
  return ids
}

function getPreferredModels(): string[] {
  const configured = process.env.GROQ_MODEL?.trim()
  const preferred = [
    configured,
    DEFAULT_MODEL,
    "llama-3.1-8b-instant",
    "gemma2-9b-it",
  ].filter((value, index, arr): value is string => Boolean(value) && arr.indexOf(value) === index)
  return preferred.length > 0 ? preferred : [DEFAULT_MODEL]
}

function isChatModelId(id: string): boolean {
  return !NON_CHAT_MODEL_PATTERN.test(id)
}

/**
 * Deterministic selection: preferred models first (in order), then the
 * remaining chat-capable models alphabetically. Capped to keep fallbacks tight.
 */
function selectCandidates(preferred: string[], availableIds: string[]): string[] {
  const chat = availableIds.filter(isChatModelId)
  const ordered = [
    ...preferred.filter((m) => chat.includes(m)),
    ...chat.filter((m) => !preferred.includes(m)).sort(),
  ]
  return (ordered.length > 0 ? ordered : [preferred[0]]).slice(0, 4)
}

// ── Chat completions ─────────────────────────────────────────────────────────

function hasTimeLeft(startedAt: number): boolean {
  return OVERALL_DEADLINE_MS - (Date.now() - startedAt) > 1_000
}

async function nextCandidateAfterModelFailure(
  apiKey: string,
  preferred: string[],
  candidates: string[],
  failedModel: string,
  currentIndex: number
): Promise<{ candidates: string[]; index: number } | null> {
  try {
    const fresh = await getModelIds(apiKey, true)
    const freshCandidates = selectCandidates(preferred, fresh).filter(
      (m) => m !== failedModel
    )
    if (freshCandidates.length > 0) return { candidates: freshCandidates, index: 0 }
  } catch {
    // Discovery failed; fall through to the static candidate list.
  }
  if (currentIndex < candidates.length - 1) {
    return { candidates, index: currentIndex + 1 }
  }
  return null
}

/**
 * Runs a streaming Groq chat completion and returns the app-level data stream
 * response, or a controlled JSON error response. Groq failures never throw.
 */
export async function groqChatCompletion(options: GroqChatOptions): Promise<Response> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    log("config", "GROQ_API_KEY is not set")
    return jsonError("config")
  }

  const preferred = getPreferredModels()
  const startedAt = Date.now()

  let candidates = [preferred[0]]
  try {
    const availableIds = await getModelIds(apiKey)
    candidates = selectCandidates(preferred, availableIds)
  } catch (err) {
    logInfo(
      `model discovery unavailable (${err instanceof Error ? err.message : "unknown"}); using preferred model only`
    )
  }

  let modelIndex = 0
  let rateLimitRetries = 0
  let transientRetries = 0
  let modelFallbacks = 0
  let lastKind: ErrorKind = "upstream"

  for (;;) {
    const model = candidates[Math.min(modelIndex, candidates.length - 1)]
    const remainingMs = OVERALL_DEADLINE_MS - (Date.now() - startedAt)
    if (remainingMs <= 1_000) {
      log(lastKind, `gave up after ${Date.now() - startedAt}ms (deadline reached)`)
      return jsonError(lastKind)
    }

    let res: Response
    try {
      res = await fetch(`${GROQ_API_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: options.messages,
          max_tokens: options.maxTokens ?? 1024,
          stream: true,
        }),
        signal: AbortSignal.timeout(Math.min(CHAT_REQUEST_TIMEOUT_MS, remainingMs)),
      })
    } catch (err) {
      lastKind = isTimeoutError(err) ? "timeout" : "upstream"
      if (transientRetries < MAX_TRANSIENT_RETRIES && hasTimeLeft(startedAt)) {
        transientRetries += 1
        logInfo(
          `${lastKind} on "${model}" (${err instanceof Error ? err.message : "unknown"}), retry ${transientRetries}/${MAX_TRANSIENT_RETRIES}`
        )
        await sleep(backoffDelay(transientRetries))
        continue
      }
      log(lastKind, `request to "${model}" failed after ${transientRetries} retries`)
      return jsonError(lastKind)
    }

    if (res.ok && res.body) {
      return toAppStream(res)
    }

    const errText = await res.text().catch(() => "")

    if (res.status === 429) {
      lastKind = "rate_limit"
      if (rateLimitRetries < MAX_RATE_LIMIT_RETRIES && hasTimeLeft(startedAt)) {
        rateLimitRetries += 1
        const delay = retryAfterDelay(res.headers.get("retry-after"), rateLimitRetries)
        logInfo(
          `rate limited (429), retry ${rateLimitRetries}/${MAX_RATE_LIMIT_RETRIES} in ${delay}ms`
        )
        await sleep(delay)
        continue
      }
      log("rate_limit", `persistent 429 after ${rateLimitRetries} retries`)
      return jsonError("rate_limit")
    }

    if (
      isModelUnavailable(res.status, errText) &&
      modelFallbacks < MAX_MODEL_FALLBACKS
    ) {
      modelFallbacks += 1
      logInfo(`model "${model}" rejected (${res.status}), selecting a replacement`)
      const next = await nextCandidateAfterModelFailure(
        apiKey,
        preferred,
        candidates,
        model,
        modelIndex
      )
      if (next) {
        candidates = next.candidates
        modelIndex = next.index
        continue
      }
      log("model_unavailable", `no alternative model found after "${model}" was rejected`)
      return jsonError("model_unavailable")
    }

    if (res.status >= 500 && transientRetries < MAX_TRANSIENT_RETRIES && hasTimeLeft(startedAt)) {
      lastKind = "upstream"
      transientRetries += 1
      logInfo(`transient ${res.status}, retry ${transientRetries}/${MAX_TRANSIENT_RETRIES}`)
      await sleep(backoffDelay(transientRetries))
      continue
    }

    lastKind = kindForStatus(res.status)
    log(lastKind, `status ${res.status} from "${model}": ${truncate(errText)}`)
    return jsonError(lastKind)
  }
}

// ── Stream conversion ────────────────────────────────────────────────────────

/**
 * Converts a Groq SSE stream into the app's AI data stream format
 * (`0:"token"\n` lines). Malformed chunks are skipped silently.
 */
function toAppStream(upstream: Response): Response {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      reader = upstream.body!.getReader()
      let buffer = ""
      try {
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() ?? ""

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue
            const data = line.slice(6).trim()
            if (!data || data === "[DONE]") continue
            try {
              const parsed = JSON.parse(data)
              const text = parsed?.choices?.[0]?.delta?.content
              if (text) {
                controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`))
              }
            } catch {
              // skip malformed SSE chunk
            }
          }
        }
        controller.close()
      } catch (err) {
        try {
          controller.close()
        } catch {
          // already closed or client disconnected
        }
        if (err instanceof Error && err.name !== "AbortError") {
          log("upstream", `stream interrupted: ${truncate(err.message)}`)
        }
      }
    },
    async cancel() {
      try {
        await reader?.cancel()
      } catch {
        // ignore cancellation errors
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Vercel-AI-Data-Stream": "v1",
      "Cache-Control": "no-store",
    },
  })
}
