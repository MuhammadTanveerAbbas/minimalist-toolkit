import type { NextRequest } from "next/server"
import { lookup } from "node:dns/promises"
import { isIP } from "node:net"
import { requireUser } from "@/lib/security/api-guard"

export const maxDuration = 30

const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "169.254.169.254",
  "metadata.google.internal",
  "metadata.google.com",
])

const MAX_REDIRECTS = 3

function isBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "")
  if (BLOCKED_HOSTS.has(host)) return true
  if (host.endsWith(".localhost") || host.endsWith(".internal") || host.endsWith(".local")) return true

  const version = isIP(host)
  if (version === 4) {
    const parts = host.split(".").map(Number)
    const [a, b] = parts
    if (a === 10) return true
    if (a === 127) return true
    if (a === 0) return true
    if (a === 169 && b === 254) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    if (a === 100 && b >= 64 && b <= 127) return true
    if (a >= 224) return true
  }
  if (version === 6) {
    if (host === "::1" || host === "::") return true
    // Unique local (fc00::/7) and link local (fe80::/10)
    if (/^f[cd][0-9a-f]{2}:/.test(host)) return true
    if (/^fe[89ab][0-9a-f]:/.test(host)) return true
    // IPv4 mapped addresses inherit the IPv4 rules
    const mapped = host.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
    if (mapped) return isBlockedHost(mapped[1])
  }
  return false
}

/**
 * Resolves the hostname and rejects it if any address it maps to is in a
 * private, loopback or link-local range. This blocks DNS rebinding and
 * hostnames that point at internal infrastructure.
 */
async function resolvesToPrivateAddress(hostname: string): Promise<boolean> {
  try {
    const addresses = await lookup(hostname, { all: true })
    if (addresses.length === 0) return true
    return addresses.some((entry) => isBlockedHost(entry.address))
  } catch {
    // Unresolvable host: treat as blocked rather than forwarding blindly.
    return true
  }
}

async function assertSafeUrl(candidate: URL): Promise<string | null> {
  if (!["http:", "https:"].includes(candidate.protocol)) {
    return "Only HTTP and HTTPS URLs are supported"
  }
  if (isBlockedHost(candidate.hostname)) {
    return "This URL is not allowed"
  }
  if (await resolvesToPrivateAddress(candidate.hostname)) {
    return "This URL is not allowed"
  }
  return null
}

function extractTitle(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch?.[1]) return titleMatch[1].trim()
  
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
  if (ogTitleMatch?.[1]) return ogTitleMatch[1].trim()
  
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
  if (h1Match?.[1]) return h1Match[1].replace(/<[^>]+>/g, "").trim()
  
  return ""
}

function extractMainContent(html: string): string {
  let content = html

  // Try to extract main content areas first
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
  if (mainMatch) content = mainMatch[1]
  else {
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
    if (articleMatch) content = articleMatch[1]
  }

  // Remove unwanted elements
  content = content
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<aside[\s\S]*?<\/aside>/gi, "")
    .replace(/<form[\s\S]*?<\/form>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")

  // Add spacing for block elements
  content = content
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/section>/gi, "\n\n")
    .replace(/<\/article>/gi, "\n\n")
    .replace(/<\/blockquote>/gi, "\n\n")

  // Strip all remaining HTML tags
  content = content.replace(/<[^>]+>/g, "")

  // Decode HTML entities
  content = content
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&mdash;/g, "-")
    .replace(/&ndash;/g, "-")
    .replace(/&hellip;/g, "…")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))

  // Clean up whitespace
  content = content
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim()

  // Limit to 6000 chars for better context
  if (content.length > 6000) {
    content = content.slice(0, 6000)
    const lastPeriod = content.lastIndexOf(".")
    if (lastPeriod > 5500) {
      content = content.slice(0, lastPeriod + 1)
    }
    content += "\n\n[Content truncated for length]"
  }

  return content
}

export async function POST(req: NextRequest) {
  const guard = await requireUser(req, { limit: 20, windowMs: 60_000 })
  if (guard instanceof Response) return guard

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { url } = (body ?? {}) as Record<string, unknown>

  if (!url || typeof url !== "string" || !url.trim()) {
    return Response.json({ error: "URL is required" }, { status: 400 })
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url.trim())
  } catch {
    return Response.json({ error: "Invalid URL format" }, { status: 400 })
  }

  const blocked = await assertSafeUrl(parsedUrl)
  if (blocked) {
    return Response.json({ error: blocked }, { status: 403 })
  }

  try {
    // Follow redirects manually so each hop is re-validated. A redirect to
    // an internal address must not bypass the checks above.
    let target = parsedUrl
    let response: Response | null = null

    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      response = await fetch(target.toString(), {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        redirect: "manual",
        signal: AbortSignal.timeout(15_000),
      })

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location")
        if (!location) break
        let nextTarget: URL
        try {
          nextTarget = new URL(location, target)
        } catch {
          return Response.json({ error: "The page redirected to an invalid address" }, { status: 422 })
        }
        const redirectBlocked = await assertSafeUrl(nextTarget)
        if (redirectBlocked) {
          return Response.json({ error: "This URL is not allowed" }, { status: 403 })
        }
        target = nextTarget
        continue
      }
      break
    }

    if (!response) {
      return Response.json({ error: "Failed to fetch the URL" }, { status: 422 })
    }

    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        return Response.json(
          { error: "Access denied - the website blocked our request" },
          { status: 422 }
        )
      }
      if (response.status === 404) {
        return Response.json({ error: "Page not found (404)" }, { status: 422 })
      }
      return Response.json(
        { error: `Failed to fetch: ${response.status} ${response.statusText}` },
        { status: 422 }
      )
    }

    const contentType = response.headers.get("content-type") ?? ""
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
      return Response.json(
        { error: "URL does not return HTML content" },
        { status: 422 }
      )
    }

    const html = await response.text()
    
    if (!html || html.length < 50) {
      return Response.json(
        { error: "Received empty or invalid response from URL" },
        { status: 422 }
      )
    }

    const title = extractTitle(html)
    const content = extractMainContent(html)

    if (!content || content.length < 50) {
      return Response.json(
        { error: "Could not extract meaningful content from this page" },
        { status: 422 }
      )
    }

    return Response.json({
      content,
      title: title || parsedUrl.hostname,
      url: parsedUrl.toString(),
      wordCount: content.split(/\s+/).filter(Boolean).length,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    if (message.includes("timeout") || message.includes("abort")) {
      return Response.json(
        { error: "Request timed out - the URL took too long to respond" },
        { status: 408 }
      )
    }
    if (message.includes("ENOTFOUND") || message.includes("ECONNREFUSED")) {
      return Response.json(
        { error: "Could not connect to the URL - check if it's accessible" },
        { status: 422 }
      )
    }
    return Response.json({ error: `Failed to scrape: ${message}` }, { status: 500 })
  }
}
