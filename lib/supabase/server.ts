import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

function configured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return Boolean(url && key && !url.includes("placeholder") && key !== "placeholder" && key !== "placeholder-anon-key-not-configured")
}

function notConfiguredError() {
  return new Error(
    "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (or pull from Vercel), then restart the app."
  )
}

function createStub() {
  const err = notConfiguredError()
  const auth = {
    getUser: async () => ({ data: { user: null }, error: err }),
    getSession: async () => ({ data: { session: null }, error: err }),
    signOut: async () => ({ error: err }),
    exchangeCodeForSession: async () => ({ data: { session: null, user: null }, error: err }),
  }
  const from = () => {
    const q: any = {
      select: () => q,
      insert: () => q,
      update: () => q,
      delete: () => q,
      eq: () => q,
      order: () => q,
      limit: () => q,
      single: async () => ({ data: null, error: err }),
      maybeSingle: async () => ({ data: null, error: err }),
      then: (resolve: any) => resolve({ data: null, error: err }),
    }
    return q
  }
  return { auth, from } as any
}

export async function createClient() {
  if (!configured()) return createStub()
  const cookieStore = await cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // setAll can fail in Server Components where cookies are read-only
        }
      },
    },
  })
}
