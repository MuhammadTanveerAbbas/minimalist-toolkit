import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { clientIdentifier, rateLimit } from "@/lib/security/rate-limit"

/** Routes that require a signed-in user. */
const PROTECTED_PREFIX = "/app"

/** API routes that must stay reachable without a session. */
const PUBLIC_API_PREFIXES = ["/api/keep-alive", "/api/cron"]

function hasSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return false
  if (url.includes("placeholder") || key === "placeholder" || key === "your_supabase_anon_key") return false
  return true
}

function authDisabledForTest() {
  return process.env.DISABLE_AUTH_FOR_TEST === "true"
}

/**
 * Server-side request guard.
 *
 * Decides redirects for authenticated and unauthenticated visitors before
 * any page renders, so protected content is never sent to the browser for a
 * signed-out visitor.
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const { pathname, search } = request.nextUrl

  // The auth callback and keep-alive cron are never guarded.
  if (PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return supabaseResponse
  }

  if (authDisabledForTest()) {
    return supabaseResponse
  }

  if (!hasSupabaseConfig()) {
    if (pathname.startsWith(PROTECTED_PREFIX)) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.search = ""
      url.searchParams.set("next", pathname)
      url.searchParams.set(
        "error",
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (see .env.example), then restart the dev server."
      )
      return NextResponse.redirect(url)
    }
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          error:
            "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        },
        { status: 503 }
      )
    }
    return supabaseResponse
  }

  // Rate limit the authentication endpoints to slow automated abuse.
  if (pathname === "/auth/callback" || pathname === "/login" || pathname === "/signup") {
    const limit = rateLimit(`auth:${clientIdentifier(request)}`, 30, 60_000)
    if (!limit.ok) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Too many attempts. Please wait a moment and try again." },
          { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
        )
      }
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.search = ""
      url.searchParams.set("error", "Too many sign-in attempts. Please wait a minute and try again.")
      return NextResponse.redirect(url)
    }
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtected = pathname === PROTECTED_PREFIX || pathname.startsWith(`${PROTECTED_PREFIX}/`)
  const isApi = pathname.startsWith("/api/")

  if (!user) {
    if (isProtected) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.search = ""
      url.searchParams.set("next", `${pathname}${search}`)
      return NextResponse.redirect(url)
    }
    if (isApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return supabaseResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest)$).*)",
  ],
}
