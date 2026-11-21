import { createHash } from "node:crypto"
import { NextResponse, type NextRequest } from "next/server"
import { clientIdentifier, rateLimit, type RateLimitResult } from "@/lib/security/rate-limit"
import { createClient } from "@/lib/supabase/server"

interface GuardOptions {
  limit?: number
  windowMs?: number
  scope?: string
}

function limitHeaders(result: RateLimitResult, limit: number): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(result.remaining),
  }
  if (!result.ok) headers["Retry-After"] = String(result.retryAfterSeconds)
  return headers
}

function exhausted(limit: number, result: RateLimitResult): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please wait a moment and try again." },
    { status: 429, headers: limitHeaders(result, limit) }
  )
}

/**
 * Per-IP guard for a route that middleware has already authenticated.
 * Keeps the existing shape so current routes keep working.
 */
export function requireUser(
  request: NextRequest,
  options: GuardOptions = {}
): NextResponse | null {
  const limit = options.limit ?? 30
  const windowMs = options.windowMs ?? 60_000
  const scope = options.scope ?? request.nextUrl.pathname
  const key = `api:${scope}:${clientIdentifier(request)}`

  const result = rateLimit(key, limit, windowMs)
  if (!result.ok) return exhausted(limit, result)
  return null
}

/**
 * Per-user guard. This is the budget that protects the app-owned provider keys
 * from one account hammering them from several IPs.
 */
export async function requireUserById(
  request: NextRequest,
  options: GuardOptions = {}
): Promise<NextResponse | { headers: Record<string, string>; userId: string }> {
  const limit = options.limit ?? 20
  const windowMs = options.windowMs ?? 60_000
  const scope = options.scope ?? request.nextUrl.pathname

  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const user = data?.user ?? null
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = rateLimit(`api:${scope}:user:${user.id}`, limit, windowMs)
  if (!result.ok) return exhausted(limit, result)

  return { headers: limitHeaders(result, limit), userId: user.id }
}

/**
 * Limits how often one user-supplied key can hit our server. The key itself is
 * hashed so no secret is kept in the in-memory bucket map.
 */
export function limitUserApiKeys(
  keys: Record<string, string | undefined>,
  scope: string,
  limit = 20,
  windowMs = 60_000
): NextResponse | null {
  for (const [provider, value] of Object.entries(keys)) {
    if (!value) continue
    const fingerprint = createHash("sha256").update(`${provider}:${value}`).digest("hex").slice(0, 16)
    const result = rateLimit(`api:${scope}:key:${fingerprint}`, limit, windowMs)
    if (!result.ok) return exhausted(limit, result)
  }
  return null
}

/** Rate limit for routes that can be reached without a session. */
export function limitAnonymous(
  request: NextRequest,
  scope: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  const result = rateLimit(`${scope}:${clientIdentifier(request)}`, limit, windowMs)
  if (!result.ok) return exhausted(limit, result)
  return null
}
