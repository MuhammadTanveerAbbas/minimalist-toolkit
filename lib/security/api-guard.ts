import { NextResponse, type NextRequest } from "next/server"
import { clientIdentifier, rateLimit } from "@/lib/security/rate-limit"

/**
 * Shared guard for state-changing API routes.
 *
 * Verifies the caller holds a valid Supabase session and applies a rate
 * limit keyed to the authenticated user id.
 */
export async function requireUser(
  request: NextRequest,
  options: { limit?: number; windowMs?: number; scope?: string } = {}
): Promise<{ userId: string; email: string | null } | NextResponse> {
  const limit = options.limit ?? 30
  const windowMs = options.windowMs ?? 60_000
  const scope = options.scope ?? request.nextUrl.pathname

  const { createClient } = await import("@/lib/supabase/server")
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Each route has its own budget, so a busy tool cannot exhaust the
  // allowance of an unrelated one.
  const result = rateLimit(`api:${scope}:${user.id}`, limit, windowMs)
  if (!result.ok) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } }
    )
  }

  return { userId: user.id, email: user.email ?? null }
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
