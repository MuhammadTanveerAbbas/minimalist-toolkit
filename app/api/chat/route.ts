import type { NextRequest } from "next/server"
import { groqChatCompletion } from "@/lib/promptcraft/groq"
import { requireUser } from "@/lib/security/api-guard"

export const maxDuration = 30

export async function POST(req: NextRequest) {
  const guard = await requireUser(req, { limit: 40, windowMs: 60_000 })
  if (guard instanceof Response) return guard

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { messages } = body as { messages?: Array<{ role?: string; content?: string }> }
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages are required" }, { status: 400 })
  }

  const sanitized = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12)
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content!.trim().slice(0, 4000),
    }))
    .filter((m) => m.content)

  if (sanitized.length === 0) {
    return Response.json({ error: "At least one valid message is required" }, { status: 400 })
  }

  return groqChatCompletion({
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant inside Minimalist Toolkit. Keep every response short, clear, and clean. Use plain language. Do not use em dashes or en dashes. Use commas, periods, colons, parentheses, or hyphens instead. Prefer short paragraphs or bullets. Help with code snippets, prompt writing, image prompt ideas, and development questions. If something is unknown or unavailable, say so plainly.",
      },
      ...sanitized,
    ],
    maxTokens: 700,
  })
}
