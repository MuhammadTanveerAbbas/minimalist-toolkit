import { NextResponse, type NextRequest } from "next/server"
import { clientIdentifier, rateLimit } from "@/lib/security/rate-limit"

/**
 * Rate-limits a route that is already protected by middleware.
 * The middleware guarantees the request is authenticated before it reaches
 * the route handler, so we only need to enforce a per-IP budget here.
 */
export function requireUser(
  request: NextRequest,
  options: { limit?: number; windowMs?: number; scope?: string } = {}
): NextResponse | null {
  const limit = options.limit ?? 30
  const windowMs = options.windowMs ?? 60_000
  const scope = options.scope ?? request.nextUrl.pathname
  const key = `api:${scope}:${clientIdentifier(request)}`

  const result = rateLimit(key, limit, windowMs)
  if (!result.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } }
    )
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
  if (!result.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } }
    )
  }
  return null
}
