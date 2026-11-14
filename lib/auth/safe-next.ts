/**
 * Restricts a redirect target to a path inside this application.
 * Rejects absolute URLs, protocol-relative URLs and backslash variants.
 */
export function getSafeNextPath(next: string | null | undefined, origin?: string): string {
  if (!next) return "/app/dashboard"
  const trimmed = next.trim()
  if (!trimmed.startsWith("/")) return "/app/dashboard"
  if (trimmed.startsWith("//") || trimmed.startsWith("/\\")) return "/app/dashboard"
  if (trimmed.includes("\\")) return "/app/dashboard"
  try {
    const base = origin ?? "https://internal.invalid"
    const url = new URL(trimmed, base)
    if (origin) {
      if (url.origin !== origin) return "/app/dashboard"
    } else if (url.origin !== "https://internal.invalid") {
      return "/app/dashboard"
    }
    const path = `${url.pathname}${url.search}${url.hash}`
    return path || "/app/dashboard"
  } catch {
    return "/app/dashboard"
  }
}

/** Client-side variant that returns null when missing or unsafe. */
export function getSafeNextOrNull(next: string | null | undefined): string | null {
  if (!next?.trim()) return null
  const trimmed = next.trim()
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\") || trimmed.includes("\\")) {
    return null
  }
  try {
    const parsed = new URL(trimmed, "https://internal.invalid")
    if (parsed.origin !== "https://internal.invalid") return null
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || null
  } catch {
    return null
  }
}
