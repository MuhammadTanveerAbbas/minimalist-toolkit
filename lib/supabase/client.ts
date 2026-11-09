import { createBrowserClient } from "@supabase/ssr"

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
  const sub = { data: { subscription: { unsubscribe: () => {} } } }
  const auth = {
    getUser: async () => ({ data: { user: null }, error: err }),
    getSession: async () => ({ data: { session: null }, error: err }),
    signInWithOAuth: async () => ({ data: { provider: null, url: null }, error: err }),
    signOut: async () => ({ error: err }),
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
  if (!configured()) return createStub()
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
