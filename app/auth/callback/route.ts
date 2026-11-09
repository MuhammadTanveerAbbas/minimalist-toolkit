import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

function getSafeNextPath(next: string | null, origin: string) {
  if (!next || !next.startsWith("/")) return "/app"
  if (next.startsWith("//")) return "/app"
  try {
    const url = new URL(next, origin)
    if (url.origin !== origin) return "/app"
    return `${url.pathname}${url.search}${url.hash}` || "/app"
  } catch {
    return "/app"
  }
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")

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
  }

  return NextResponse.redirect(`${requestUrl.origin}${getSafeNextPath(next, requestUrl.origin)}`)
}
