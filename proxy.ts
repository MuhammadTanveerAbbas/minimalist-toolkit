import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

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

// Kept in sync with middleware.ts for projects that may reference this file.
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const { pathname } = request.nextUrl

  if (authDisabledForTest()) {
    return supabaseResponse
  }

  if (!hasSupabaseConfig()) {
    if (pathname.startsWith("/app")) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("next", pathname)
      url.searchParams.set("error", "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (see .env.example), then restart the dev server.")
      return NextResponse.redirect(url)
    }
    if (pathname.startsWith("/api/") && pathname !== "/api/keep-alive" && !pathname.startsWith("/api/cron")) {
      return NextResponse.json(
        { error: "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY." },
        { status: 503 }
      )
    }
    return supabaseResponse
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

  if (!user) {
    if (pathname.startsWith("/app")) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set("next", pathname)
      return NextResponse.redirect(url)
    }
    if (pathname.startsWith("/api/") && pathname !== "/api/keep-alive" && !pathname.startsWith("/api/cron")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/app", request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
