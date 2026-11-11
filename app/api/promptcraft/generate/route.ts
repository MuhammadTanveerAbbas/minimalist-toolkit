import type { NextRequest } from "next/server"
import { groqChatCompletion } from "@/lib/promptcraft/groq"
import { requireUser } from "@/lib/security/api-guard"

export const maxDuration = 30

const PLATFORM_HINTS: Record<string, string> = {
  ChatGPT:
    "Optimise for ChatGPT (GPT-4o). Use clear role-setting with 'You are…', leverage its instruction-following strength, and structure with numbered steps or sections when helpful. It handles long context well.",
  Claude:
    "Optimise for Claude (Anthropic). Claude excels at nuanced reasoning and long documents. Use XML-style tags like <instructions> and <context> to delimit sections. Be explicit about desired output format and length.",
  Gemini:
    "Optimise for Google Gemini. Gemini responds well to structured prompts with explicit constraints. Use clear delimiters, specify output format upfront, and leverage its multimodal awareness where relevant.",
  Mistral:
    "Optimise for Mistral AI models. Mistral is efficient and instruction-tuned. Keep prompts concise and direct. Use [INST] / [/INST] style thinking if helpful, and avoid unnecessary verbosity.",
  Cursor:
    "Optimise for Cursor (AI code editor). This prompt will be used inside an IDE. Focus on precise, actionable coding instructions. Reference file context, specify language/framework, and use diff-friendly output formats.",
  "Grok":
    "Optimise for xAI Grok. Keep prompts direct and conversational. Grok responds well to clear questions, explicit constraints, and a natural tone without excessive formatting.",
}

const BASE_SYSTEM_PROMPT = `You are a world-class AI prompt engineer with deep expertise in crafting prompts that consistently produce exceptional results across all major AI models.

Your task: Generate a single, production-ready prompt based on the user's inputs.

Output ONLY the final prompt - no explanations, no preamble, no markdown code fences, no surrounding quotes. Just the raw prompt text.

Prompt engineering principles to apply:
- Open with a clear role or persona when it adds value (e.g. "You are an expert...")
- State the task with precision - what to do, what to produce, what to avoid
- Include relevant constraints: format, length, style, audience, tone
- Add examples or structure (numbered steps, sections) when the task benefits from it
- End with a clear call to action or output instruction
- Make it immediately usable - no placeholders unless clearly marked with [brackets]
- Calibrate length to complexity: simple tasks get concise prompts, complex tasks get structured ones`

function buildSystemPrompt(platform: string): string {
  const hint = PLATFORM_HINTS[platform]
  if (!hint) return BASE_SYSTEM_PROMPT
  return `${BASE_SYSTEM_PROMPT}\n\nPlatform-specific guidance:\n${hint}`
}

function validateInput(
  body: unknown
): { topic: string; tone: string; category: string; context: string; platform: string } | null {
  if (!body || typeof body !== "object") return null
  const b = body as Record<string, unknown>
  if (typeof b.topic !== "string" || !b.topic.trim()) return null
  if (typeof b.tone !== "string" || !b.tone.trim()) return null
  if (typeof b.category !== "string" || !b.category.trim()) return null
  return {
    topic: b.topic.trim().slice(0, 500),
    tone: b.tone.trim().slice(0, 100),
    category: b.category.trim().slice(0, 100),
    context: typeof b.context === "string" ? b.context.trim().slice(0, 2000) : "",
    platform: typeof b.platform === "string" ? b.platform.trim().slice(0, 50) : "",
  }
}

export async function POST(req: NextRequest) {
  const guard = await requireUser(req, { limit: 30, windowMs: 60_000 })
  if (guard instanceof Response) return guard

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const input = validateInput(body)
  if (!input) {
    return Response.json({ error: "topic, tone, and category are required" }, { status: 400 })
  }

  const platformLine = input.platform ? `\nTarget Platform: ${input.platform}` : ""

  const userMessage = `Generate a high-quality AI prompt for the following:

Topic: ${input.topic}
Category: ${input.category}
Tone: ${input.tone}${platformLine}${input.context ? `\nAdditional context: ${input.context}` : ""}

Output only the prompt itself.`

  return groqChatCompletion({
    messages: [
      { role: "system", content: buildSystemPrompt(input.platform) },
      { role: "user", content: userMessage },
    ],
    maxTokens: 1024,
  })
}
