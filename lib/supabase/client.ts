import { createBrowserClient } from "@supabase/ssr"
import { getSupabaseConfig, SUPABASE_SETUP_MESSAGE } from "@/lib/supabase/config"

function createStub() {
  const err = new Error(SUPABASE_SETUP_MESSAGE)
  const sub = { data: { subscription: { unsubscribe: () => {} } } }
  const auth = {
    getUser: async () => ({ data: { user: null }, error: err }),
    getSession: async () => ({ data: { session: null }, error: err }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: err }),
    signUp: async () => ({ data: { user: null, session: null }, error: err }),
    signInWithOAuth: async () => ({ data: { provider: null, url: null }, error: err }),
    signOut: async () => ({ error: err }),
    resetPasswordForEmail: async () => ({ data: {}, error: err }),
    updateUser: async () => ({ data: { user: null }, error: err }),
    onAuthStateChange: () => sub,
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

export function createClient() {
  const config = getSupabaseConfig()
  if (!config) return createStub()
  return createBrowserClient(config.url, config.key)
}
