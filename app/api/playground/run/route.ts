import type { NextRequest } from "next/server"
import { z } from "zod"
import { runModel } from "@/lib/providers/registry"
import { limitUserApiKeys, requireUser, requireUserById } from "@/lib/security/api-guard"
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 60

/** App-owned keys are a shared resource, so each account gets a daily budget. */
const DAILY_APP_KEY_RUNS = 50

const keySchema = z.string().trim().min(8).max(300).regex(/^[A-Za-z0-9._-]+$/)

const sideSchema = z.object({
  provider: z.enum(["groq", "openrouter"]),
  model: z.string().min(1).max(200),
  prompt: z.string().min(1).max(8000),
})

const bodySchema = z.object({
  system: z.string().max(4000).optional(),
  left: sideSchema,
  right: sideSchema,
  keys: z
    .object({
      groq: keySchema.optional(),
      openrouter: keySchema.optional(),
    })
    .optional(),
})

function startOfToday(): string {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString()
}

export async function POST(req: NextRequest) {
  const guard = requireUser(req, { limit: 12, windowMs: 60_000, scope: "playground:run" })
  if (guard) return guard

  const userGuard = await requireUserById(req, {
    limit: 20,
    windowMs: 60_000,
    scope: "playground:run:user",
  })
  if (userGuard instanceof Response) return userGuard

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { system, left, right, keys } = parsed.data

  const keyGuard = limitUserApiKeys(keys ?? {}, "playground:run:keys", 20)
  if (keyGuard) return keyGuard

  // A run without a key on either side consumes the shared app-key budget.
  const usesAppKey = !keys?.groq || !keys?.openrouter
  const supabase = await createClient()

  if (usesAppKey) {
    try {
      const { count, error } = await supabase
        .from("playground_runs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userGuard.userId)
        .gte("created_at", startOfToday())
      if (!error && count != null && count >= DAILY_APP_KEY_RUNS) {
        return Response.json(
          {
            error: `You have used today's ${DAILY_APP_KEY_RUNS} shared-key runs. Add your own API key in the Playground to keep testing.`,
          },
          { status: 429, headers: { "Retry-After": "3600", ...userGuard.headers } }
        )
      }
    } catch {
      // The table may not exist yet. The per-minute guard still applies.
    }
  }

  const [leftResult, rightResult] = await Promise.all([
    runModel({
      provider: left.provider,
      model: left.model,
      prompt: left.prompt,
      system,
      apiKey: keys?.[left.provider],
    }),
    runModel({
      provider: right.provider,
      model: right.model,
      prompt: right.prompt,
      system,
      apiKey: keys?.[right.provider],
    }),
  ])

  let saved = false
  try {
    const { data } = await supabase.auth.getUser()
    const user = data?.user ?? null
    if (user) {
      const { error } = await supabase.from("playground_runs").insert({
        user_id: user.id,
        left_provider: left.provider,
        left_model: left.model,
        right_provider: right.provider,
        right_model: right.model,
        left_prompt: left.prompt,
        right_prompt: right.prompt,
        left_output: leftResult.ok ? leftResult.text : null,
        right_output: rightResult.ok ? rightResult.text : null,
        left_error: leftResult.ok ? null : leftResult.error,
        right_error: rightResult.ok ? null : rightResult.error,
        left_latency_ms: leftResult.latencyMs,
        right_latency_ms: rightResult.latencyMs,
        left_total_tokens: leftResult.ok ? leftResult.totalTokens : null,
        right_total_tokens: rightResult.ok ? rightResult.totalTokens : null,
        left_cost_usd: leftResult.ok ? leftResult.costUsd : null,
        right_cost_usd: rightResult.ok ? rightResult.costUsd : null,
      })
      if (!error) saved = true
    }
  } catch {
    saved = false
  }

  return Response.json(
    { left: leftResult, right: rightResult, saved },
    { headers: userGuard.headers }
  )
}
