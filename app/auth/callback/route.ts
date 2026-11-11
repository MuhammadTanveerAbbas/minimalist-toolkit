import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Restricts a redirect target to a path inside this application.
 * Rejects absolute URLs, protocol-relative URLs and backslash variants.
 */
function getSafeNextPath(next: string | null, origin: string): string {
  if (!next) return "/app/dashboard"
  const trimmed = next.trim()
  if (!trimmed.startsWith("/")) return "/app/dashboard"
  if (trimmed.startsWith("//") || trimmed.startsWith("/\\")) return "/app/dashboard"
  if (trimmed.includes("\\")) return "/app/dashboard"
  try {
    const url = new URL(trimmed, origin)
    if (url.origin !== origin) return "/app/dashboard"
    const path = `${url.pathname}${url.search}${url.hash}`
    return path || "/app/dashboard"
  } catch {
    return "/app/dashboard"
  }
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

  const safeNext = getSafeNextPath(next, requestUrl.origin)

  if (error) {
    const msg = encodeURIComponent(errorDescription ?? error)
    return NextResponse.redirect(`${requestUrl.origin}/login?error=${msg}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      const msg = encodeURIComponent(exchangeError.message)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=${msg}`)
    }

    // Only continue to a protected path when a session was actually
    // established. Otherwise fall back to the dashboard.
    const { data } = await supabase.auth.getUser()
    if (!data?.user) {
      return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent("Sign-in could not be completed. Please try again.")}`)
    }
  } else {
    return NextResponse.redirect(`${requestUrl.origin}/login`)
  }

  return NextResponse.redirect(`${requestUrl.origin}${safeNext}`)
}
