export interface SupabaseConfig {
  url: string
  key: string
}

export const SUPABASE_SETUP_MESSAGE =
  "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL to an https:// project URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, then restart the app."

const PLACEHOLDER_MARKS = ["placeholder", "your_", "not-configured"]

/**
 * Returns usable credentials, or null when they are missing, still templated,
 * or not an HTTP(S) URL. Callers fall back to a local stub instead of letting
 * supabase-js throw during render.
 */
export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? ""
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? ""

  if (!url || !key) return null

  const lowerUrl = url.toLowerCase()
  const lowerKey = key.toLowerCase()
  if (PLACEHOLDER_MARKS.some((mark) => lowerUrl.includes(mark) || lowerKey.includes(mark))) {
    return null
  }

  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null
  } catch {
    return null
  }

  return { url, key }
}
