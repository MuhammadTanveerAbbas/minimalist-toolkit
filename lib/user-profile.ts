/**
 * Normalises a Supabase auth user into the small set of display fields the
 * workspace needs. The app signs in with Google, so the interesting values
 * live in `user_metadata` and the exact key names differ between providers
 * and between GoTrue versions.
 */

export interface AuthUserLike {
  email?: string | null
  /** Legacy top-level fields that GoTrue returns for OAuth users. */
  avatar_url?: string | null
  full_name?: string | null
  user_metadata?: Record<string, unknown> | null
}

export interface UserProfile {
  /** Full display name, already formatted for showing to a person. */
  name: string | null
  /** First name only, used for short greetings. */
  firstName: string | null
  email: string | null
  /** Verified absolute http(s) URL of the profile picture, if there is one. */
  avatarUrl: string | null
  /** One or two letters for the fallback avatar. */
  initials: string
}

const AVATAR_KEYS = ["avatar_url", "picture", "photo_url", "image_url"]
const NAME_KEYS = ["full_name", "name", "display_name"]

function readString(metadata: Record<string, unknown>, keys: readonly string[]): string | null {
  for (const key of keys) {
    const value = metadata[key]
    if (typeof value === "string" && value.trim()) return value.trim()
  }
  return null
}

/** Only absolute http(s) URLs are accepted, so a metadata value can never inject a script URL. */
function safeImageUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null
  try {
    const url = new URL(value.trim())
    if (url.protocol !== "https:" && url.protocol !== "http:") return null
    return url.toString()
  } catch {
    return null
  }
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

/** Builds a readable name from an email local part: "tanveer.abbas" becomes "Tanveer Abbas". */
function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? ""
  const parts = local.split(/[._-]+/).filter(Boolean)
  if (!parts.length) return ""
  return titleCase(parts.join(" "))
}

function initialsFrom(text: string): string {
  const words = text.split(/\s+/).filter(Boolean)
  if (!words.length) return ""
  const first = words[0].charAt(0)
  const second = words.length > 1 ? words[words.length - 1].charAt(0) : ""
  return (first + second).toUpperCase()
}

export function getUserProfile(user: AuthUserLike | null | undefined): UserProfile {
  const email = user?.email ?? null
  const metadata = (user?.user_metadata ?? {}) as Record<string, unknown>

  const given = typeof metadata.given_name === "string" ? metadata.given_name.trim() : ""
  const family = typeof metadata.family_name === "string" ? metadata.family_name.trim() : ""
  const partsName = titleCase([given, family].filter(Boolean).join(" "))

  const topLevelFullName =
    typeof user?.full_name === "string" && user.full_name.trim() ? user.full_name.trim() : null

  const name =
    readString(metadata, NAME_KEYS) ??
    topLevelFullName ??
    (partsName || null) ??
    (email ? nameFromEmail(email) || null : null)

  const avatarUrl =
    AVATAR_KEYS.map((key) => safeImageUrl(metadata[key]))
      .find(Boolean) ??
    safeImageUrl(user?.avatar_url)

  const initials = name ? initialsFrom(name) : email ? initialsFrom(email) : ""

  return {
    name,
    firstName: name ? name.split(/\s+/)[0] : null,
    email,
    avatarUrl,
    initials,
  }
}
