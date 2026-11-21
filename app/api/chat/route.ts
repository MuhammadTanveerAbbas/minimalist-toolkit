import type { NextRequest } from "next/server"
import { groqChatCompletion } from "@/lib/promptcraft/groq"
import { requireUser } from "@/lib/security/api-guard"
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 30

type SnippetSummary = {
  title: string
  language: string
  description?: string | null
  code: string
  tags?: string[] | null
}

/** Keep the system prompt bounded even with a large snippet library. */
const MAX_SNIPPET_CONTEXT_CHARS = 24_000

export async function POST(req: NextRequest) {
  const guard = requireUser(req, { limit: 40, windowMs: 60_000 })
  if (guard) return guard

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { messages, snippets } = body as {
    messages?: Array<{ role?: string; content?: string }>
    snippets?: SnippetSummary[]
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages are required" }, { status: 400 })
  }

  const sanitized = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12)
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content!.trim().slice(0, 4000) }))
    .filter((m) => m.content)

  if (sanitized.length === 0) {
    return Response.json({ error: "At least one valid message is required" }, { status: 400 })
  }

  // Load the user's full saved library on the server so chat always has the
  // current snippets. The client payload is only a fallback for local use.
  let library: SnippetSummary[] = []
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    const user = data?.user ?? null
    if (user) {
      const { data: rows } = await supabase
        .from("snippets")
        .select("title, language, description, code, tags")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(200)
      library = (rows ?? []) as SnippetSummary[]
    }
  } catch {
    library = []
  }

  if (library.length === 0 && Array.isArray(snippets)) {
    library = snippets.filter(
      (s): s is SnippetSummary =>
        Boolean(s) && typeof s.title === "string" && typeof s.code === "string"
    )
  }

  const included: string[] = []
  let used = 0
  for (const snippet of library) {
    const line =
      `- ${snippet.title} (${snippet.language || "text"})` +
      `${snippet.description ? `: ${snippet.description}` : ""}` +
      `\n\`\`\`${snippet.language || "text"}\n${snippet.code.slice(0, 700)}\n\`\`\``
    if (used + line.length > MAX_SNIPPET_CONTEXT_CHARS) break
    included.push(line)
    used += line.length
  }

  const snippetContext = library.length
    ? `\n\nThe user has ${library.length} saved snippets. ${included.length} are included below, newest first. Refer to them by title when relevant.\n${included.join("\n")}\n`
    : ""

  return groqChatCompletion({
    messages: [
      {
        role: "system",
        content:
          "You are a concise assistant inside Minimalist Toolkit. Be short and direct. No filler, no fluff. Use plain language. No em dashes or en dashes - use commas, colons, or hyphens. Bullets over paragraphs. Help with code, SQL, prompts, and product decisions. Reference the user's snippets when relevant." +
          snippetContext,
      },
      ...sanitized,
    ],
    maxTokens: 800,
  })
}
