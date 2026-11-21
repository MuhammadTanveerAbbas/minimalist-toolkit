import type { NextRequest } from "next/server"
import { requireUser } from "@/lib/security/api-guard"
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 30

interface PlaygroundRunRow {
  id: string
  left_provider: string
  left_model: string
  right_provider: string
  right_model: string
  left_prompt: string
  right_prompt: string
  left_output: string | null
  right_output: string | null
  left_error: string | null
  right_error: string | null
  left_latency_ms: number | null
  right_latency_ms: number | null
  left_total_tokens: number | null
  right_total_tokens: number | null
  left_cost_usd: number | null
  right_cost_usd: number | null
  created_at: string
}

const SELECT_COLUMNS =
  "id,left_provider,left_model,right_provider,right_model,left_prompt,right_prompt,left_output,right_output,left_error,right_error,left_latency_ms,right_latency_ms,left_total_tokens,right_total_tokens,left_cost_usd,right_cost_usd,created_at"

export async function GET(req: NextRequest) {
  const guard = requireUser(req, { limit: 30, windowMs: 60_000, scope: "playground:runs:get" })
  if (guard) return guard

  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const user = data?.user ?? null
  if (!user) return Response.json({ runs: [], unavailable: false })

  try {
    const { data: rows, error } = await supabase
      .from("playground_runs")
      .select(SELECT_COLUMNS)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      return Response.json({ runs: [], unavailable: true })
    }

    const runs = (rows ?? []) as PlaygroundRunRow[]
    return Response.json({ runs, unavailable: false })
  } catch {
    return Response.json({ runs: [], unavailable: true })
  }
}

export async function DELETE(req: NextRequest) {
  const guard = requireUser(req, { limit: 20, windowMs: 60_000, scope: "playground:runs:delete" })
  if (guard) return guard

  const id = req.nextUrl.searchParams.get("id")
  if (!id) return Response.json({ error: "id is required" }, { status: 400 })

  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const user = data?.user ?? null
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { error } = await supabase
      .from("playground_runs")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
    if (error) return Response.json({ error: "Could not delete the run." }, { status: 500 })
    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: "Could not delete the run." }, { status: 500 })
  }
}
