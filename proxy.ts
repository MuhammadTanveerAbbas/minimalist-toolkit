import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { clientIdentifier, rateLimit } from "@/lib/security/rate-limit"
import { getSupabaseConfig, SUPABASE_SETUP_MESSAGE } from "@/lib/supabase/config"

const PROTECTED_PREFIX = "/app"
const PUBLIC_API_PREFIXES = ["/api/keep-alive", "/api/cron/news"]

function authDisabledForTest() {
  return process.env.DISABLE_AUTH_FOR_TEST === "true"
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const { pathname, search } = request.nextUrl

  if (PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return supabaseResponse
  }

  if (authDisabledForTest()) {
    return supabaseResponse
  }

  const config = getSupabaseConfig()
  if (!config) {
    if (pathname.startsWith(PROTECTED_PREFIX)) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.search = ""
      url.searchParams.set("next", pathname)
      url.searchParams.set("error", SUPABASE_SETUP_MESSAGE)
      return NextResponse.redirect(url)
    }
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: SUPABASE_SETUP_MESSAGE }, { status: 503 })
    }
    return supabaseResponse
  }

  if (
    pathname === "/auth/callback" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password"
  ) {
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

  const supabase = createServerClient(config.url, config.key, {
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
  })

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

  if (pathname === "/" || pathname === "/login" || pathname === "/signup") {
    const rawNext = request.nextUrl.searchParams.get("next")
    let destination = "/app/dashboard"
    if (rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") && !rawNext.includes("\\")) {
      destination = rawNext
    }
    const url = request.nextUrl.clone()
    url.pathname = destination.split("?")[0]
    url.search = destination.includes("?") ? destination.slice(destination.indexOf("?")) : ""
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export default proxy

export const matcher = [
  "/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest)$).*)",
]
