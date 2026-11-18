import type { NextRequest } from "next/server"
import { groqChatCompletion } from "@/lib/promptcraft/groq"
import { requireUser } from "@/lib/security/api-guard"

export const maxDuration = 30

type SnippetSummary = { title: string; language: string; description?: string; code: string }

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

  const snippetContext =
    Array.isArray(snippets) && snippets.length > 0
      ? `\n\nUser's saved snippets:\n` +
        snippets
          .slice(0, 30)
          .map((s) =>
            `- ${s.title} (${s.language})${s.description ? `: ${s.description}` : ""}\n\`\`\`${s.language}\n${s.code.slice(0, 800)}\n\`\`\``
          )
          .join("\n")
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
