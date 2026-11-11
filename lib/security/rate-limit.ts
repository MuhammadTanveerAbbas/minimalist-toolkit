import { NextResponse, type NextRequest } from "next/server"

/**
 * In-memory fixed-window rate limiter.
 *
 * Each server instance keeps its own counters. On a single-instance
 * deployment (or a single Vercel function) this is accurate. On a
 * multi-instance deployment it becomes best-effort rather than exact,
 * which is why it is paired with upstream provider limits.
 */
interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

const MAX_BUCKETS = 10_000

function sweep(now: number) {
  if (buckets.size < MAX_BUCKETS) return
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

export interface RateLimitResult {
  ok: boolean
  remaining: number
  retryAfterSeconds: number
}

/**
 * @param key    Identifier to rate limit on, e.g. an IP address or user id.
 * @param limit  Allowed requests per window.
 * @param windowMs Window length in milliseconds.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  sweep(now)

  const existing = buckets.get(key)
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1, retryAfterSeconds: Math.ceil(windowMs / 1000) }
  }

  existing.count += 1
  if (existing.count > limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000))
    return { ok: false, remaining: 0, retryAfterSeconds }
  }

  return { ok: true, remaining: limit - existing.count, retryAfterSeconds: 0 }
}

export function clientIdentifier(request: Request | NextRequest): string {
  const headers = request.headers
  const forwarded = headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }
  return headers.get("x-real-ip") ?? headers.get("cf-connecting-ip") ?? "unknown"
}

export function rateLimitResponse(result: RateLimitResult, message: string): NextResponse {
  return NextResponse.json(
    { error: message },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfterSeconds),
        "X-RateLimit-Remaining": "0",
      },
    }
  )
}
