import type { NextRequest } from "next/server"
import { z } from "zod"
import { listProviders } from "@/lib/providers/registry"
import { limitUserApiKeys, requireUser, requireUserById } from "@/lib/security/api-guard"

export const maxDuration = 30

const keySchema = z.string().trim().min(8).max(300).regex(/^[A-Za-z0-9._-]+$/)

const bodySchema = z.object({
  all: z.boolean().optional(),
  keys: z
    .object({
      groq: keySchema.optional(),
      openrouter: keySchema.optional(),
    })
    .optional(),
})

export async function GET(req: NextRequest) {
  const guard = requireUser(req, { limit: 30, windowMs: 60_000, scope: "providers:models" })
  if (guard) return guard

  const all = req.nextUrl.searchParams.get("all") === "1"
  const providers = await listProviders({ all })

  return Response.json(
    { providers },
    { headers: { "Cache-Control": "no-store" } }
  )
}

/** Accepts optional user-supplied keys so people can test their own accounts. */
export async function POST(req: NextRequest) {
  const guard = requireUser(req, { limit: 30, windowMs: 60_000, scope: "providers:models:post" })
  if (guard) return guard

  const userGuard = await requireUserById(req, {
    limit: 30,
    windowMs: 60_000,
    scope: "providers:models:user",
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

  const keyGuard = limitUserApiKeys(parsed.data.keys ?? {}, "providers:models:keys", 30)
  if (keyGuard) return keyGuard

  const providers = await listProviders({ all: parsed.data.all === true, keys: parsed.data.keys })

  return Response.json(
    { providers },
    { headers: { "Cache-Control": "no-store", ...userGuard.headers } }
  )
}
