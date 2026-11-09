export const maxDuration = 30

const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "169.254.169.254",
  "metadata.google.internal",
])

function isBlockedHost(hostname: string): boolean {
  if (BLOCKED_HOSTS.has(hostname)) return true
  if (/^10\./.test(hostname)) return true
  if (/^192\.168\./.test(hostname)) return true
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) return true
  return false
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

export async function POST(req: Request) {
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

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return Response.json({ error: "Only HTTP and HTTPS URLs are supported" }, { status: 400 })
  }

  if (isBlockedHost(parsedUrl.hostname)) {
    return Response.json({ error: "This URL is not allowed" }, { status: 403 })
  }

  try {
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      signal: AbortSignal.timeout(15_000),
    })

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
