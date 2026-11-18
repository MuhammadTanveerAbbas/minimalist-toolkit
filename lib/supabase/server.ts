import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getSupabaseConfig, SUPABASE_SETUP_MESSAGE } from "@/lib/supabase/config"

function createStub() {
  const err = new Error(SUPABASE_SETUP_MESSAGE)
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
  const config = getSupabaseConfig()
  if (!config) return createStub()
  const cookieStore = await cookies()
  return createServerClient(config.url, config.key, {
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
