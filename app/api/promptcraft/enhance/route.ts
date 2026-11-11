import type { NextRequest } from "next/server"
import { groqChatCompletion } from "@/lib/promptcraft/groq"
import { requireUser } from "@/lib/security/api-guard"

export const maxDuration = 30

const SYSTEM_PROMPT = `You are a world-class AI prompt engineer. Your task is to take an existing prompt and make it significantly better.

Output ONLY the enhanced prompt - no explanations, no preamble, no markdown, no surrounding quotes. Just the improved prompt text.

Enhancement principles:
- Sharpen vague instructions into precise, actionable ones
- Add missing context, constraints, or output format requirements
- Strengthen the role/persona if it improves results
- Remove redundancy and tighten the language
- Ensure the prompt is unambiguous and leaves no room for misinterpretation
- Preserve the original intent - improve execution, not direction
- If the prompt lacks a clear output format, add one`

export async function POST(req: NextRequest) {
  const guard = await requireUser(req, { limit: 30, windowMs: 60_000 })
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

  const { prompt } = body as Record<string, unknown>
  if (typeof prompt !== "string" || !prompt.trim()) {
    return Response.json({ error: "prompt is required" }, { status: 400 })
  }

  const sanitizedPrompt = prompt.trim().slice(0, 4000)

  return groqChatCompletion({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Enhance this prompt:\n\n${sanitizedPrompt}\n\nOutput only the enhanced prompt.`,
      },
    ],
    maxTokens: 1024,
  })
}
