import { createClient } from "@/lib/supabase/server"
import { getSafeNextPath } from "@/lib/auth/safe-next"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")
  const type = requestUrl.searchParams.get("type")

  // Recovery links should land on the update-password screen even if `next` was omitted.
  const preferredNext =
    type === "recovery" || type === "password_recovery"
      ? next || "/update-password"
      : next

  const safeNext = getSafeNextPath(preferredNext, requestUrl.origin)

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

    const { data } = await supabase.auth.getUser()
    if (!data?.user) {
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent("Sign-in could not be completed. Please try again.")}`
      )
    }
  } else {
    return NextResponse.redirect(`${requestUrl.origin}/login`)
  }

  return NextResponse.redirect(`${requestUrl.origin}${safeNext}`)
}
