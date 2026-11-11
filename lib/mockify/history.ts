"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { normalizeModel, normalizeSize, type SizeValue } from "@/lib/mockify/generate-image"

/** localStorage key that holds the image payloads (base64 data URLs) */
export const MOCKIFY_HISTORY_KEY = "mockify_history"

/** Maximum number of generations kept per store */
export const MAX_HISTORY = 20

export type HistoryMode = "database" | "local"

export interface HistoryItem {
  id: string
  prompt: string
  model: string
  size: SizeValue
  imageUrl: string
  timestamp: Date
}

interface DbRow {
  id: string
  prompt: string
  model: string | null
  size: string | null
  image_url: string | null
  created_at: string
}

interface StoredItem {
  id: string
  prompt: string
  model: string
  size?: string
  imageUrl: string
  timestamp: string
}

function readLocal(): HistoryItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(MOCKIFY_HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StoredItem[]
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (item) =>
          item &&
          typeof item.id === "string" &&
          typeof item.prompt === "string" &&
          typeof item.imageUrl === "string"
      )
      .map((item) => ({
        id: item.id,
        prompt: item.prompt,
        model: item.model ?? "auto",
        size: normalizeSize(item.size),
        imageUrl: item.imageUrl,
        timestamp: new Date(item.timestamp),
      }))
      .filter((item) => !Number.isNaN(item.timestamp.getTime()))
      .slice(0, MAX_HISTORY)
  } catch {
    return []
  }
}

function serialize(items: HistoryItem[]): string {
  const stored: StoredItem[] = items.map((item) => ({
    id: item.id,
    prompt: item.prompt,
    model: item.model,
    size: item.size,
    imageUrl: item.imageUrl,
    timestamp: item.timestamp.toISOString(),
  }))
  return JSON.stringify(stored)
}

/**
 * Writes the local store. Image data URLs are large, so a quota error is
 * retried with progressively fewer (older) entries instead of losing
 * everything.
 */
function writeLocal(items: HistoryItem[]): void {
  if (typeof window === "undefined") return
  for (let count = items.length; count > 0; count--) {
    try {
      window.localStorage.setItem(MOCKIFY_HISTORY_KEY, serialize(items.slice(0, count)))
      return
    } catch {
      /* quota exceeded, retry with fewer entries */
    }
  }
  try {
    window.localStorage.removeItem(MOCKIFY_HISTORY_KEY)
  } catch {
    /* storage unavailable */
  }
}

/**
 * The database column `image_url` is limited to 2048 characters, so base64
 * image payloads are never sent to it. Only short, non-data URLs are stored.
 */
function dbSafeImageUrl(imageUrl: string): string | null {
  if (!imageUrl) return null
  if (imageUrl.startsWith("data:")) return null
  return imageUrl.length <= 2048 ? imageUrl : null
}

function byNewest(a: HistoryItem, b: HistoryItem): number {
  return b.timestamp.getTime() - a.timestamp.getTime()
}

/**
 * Merges the database rows (authoritative metadata) with the local store
 * (authoritative image payload). Items are matched on id, so nothing is
 * duplicated and nothing is dropped.
 */
function mergeSources(rows: DbRow[], local: HistoryItem[]): HistoryItem[] {
  const localById = new Map(local.map((item) => [item.id, item]))
  const merged: HistoryItem[] = []
  const seen = new Set<string>()

  for (const row of rows) {
    seen.add(row.id)
    const localItem = localById.get(row.id)
    merged.push({
      id: row.id,
      prompt: row.prompt,
      model: normalizeModel(row.model),
      size: normalizeSize(row.size),
      imageUrl: localItem?.imageUrl ?? row.image_url ?? "",
      timestamp: new Date(row.created_at),
    })
  }

  // Items that only exist locally (generated while signed out, or before the
  // row was written) still belong in the list.
  for (const item of local) {
    if (seen.has(item.id)) continue
    merged.push(item)
  }

  return merged.sort(byNewest).slice(0, MAX_HISTORY)
}

/**
 * Mockify generation history.
 *
 * Metadata (prompt, model, size, timestamp) lives in
 * `public.mockify_generations`. Image bytes are far too large for the
 * `image_url` column, so they stay in localStorage and the two sources are
 * merged by id on load. When the user is signed out, or the table is not
 * reachable yet, the tool falls back to localStorage only.
 */
export function useMockifyHistory() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mode, setMode] = useState<HistoryMode>("local")
  const supabaseRef = useRef(createClient())
  const userIdRef = useRef<string | null>(null)
  const dbRowsRef = useRef<DbRow[]>([])

  const load = useCallback(async () => {
    const local = readLocal()
    const supabase = supabaseRef.current

    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) {
        userIdRef.current = null
        dbRowsRef.current = []
        setMode("local")
        setItems(local)
        setIsLoading(false)
        return
      }
      userIdRef.current = user.id

      const { data, error } = await supabase
        .from("mockify_generations")
        .select("id, prompt, model, size, image_url, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(MAX_HISTORY)

      if (error) {
        // The migration may not be applied yet. The tool must still work, so
        // fall back to the local store and keep the session id for writes.
        dbRowsRef.current = []
        setMode("local")
        setItems(local)
        setIsLoading(false)
        return
      }

      const rows = (data ?? []) as DbRow[]
      dbRowsRef.current = rows
      setMode("database")
      setItems(mergeSources(rows, local))
    } catch {
      setMode("local")
      setItems(local)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // Deferred by a tick so the initial fetch does not run inside the effect
    // body. This also keeps the first paint free of a cascading render.
    const timer = window.setTimeout(() => {
      void load()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [load])

  useEffect(() => {
    const supabase = supabaseRef.current
    const { data } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        // Deferred so the auth client is not re-entered inside its own callback.
        window.setTimeout(() => void load(), 0)
      }
    })
    return () => data.subscription.unsubscribe()
  }, [load])

  // Keep the list in sync when another tab writes to the same key.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== MOCKIFY_HISTORY_KEY) return
      setItems(mergeSources(dbRowsRef.current, readLocal()))
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const add = useCallback(async (item: HistoryItem) => {
    const local = readLocal()
    const nextLocal = [item, ...local.filter((i) => i.id !== item.id)].slice(0, MAX_HISTORY)
    writeLocal(nextLocal)
    setItems((prev) =>
      [item, ...prev.filter((i) => i.id !== item.id)].sort(byNewest).slice(0, MAX_HISTORY)
    )

    const supabase = supabaseRef.current
    const userId = userIdRef.current
    if (!userId) return

    try {
      const { error } = await supabase.from("mockify_generations").insert({
        id: item.id,
        user_id: userId,
        prompt: item.prompt,
        model: item.model,
        size: item.size,
        image_url: dbSafeImageUrl(item.imageUrl),
        created_at: item.timestamp.toISOString(),
      })
      if (error) {
        // The row could not be written. The local copy still holds the image.
        setMode("local")
      }
    } catch {
      setMode("local")
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    const nextLocal = readLocal().filter((item) => item.id !== id)
    writeLocal(nextLocal)
    setItems((prev) => prev.filter((item) => item.id !== id))

    const supabase = supabaseRef.current
    if (!userIdRef.current) return
    try {
      await supabase.from("mockify_generations").delete().eq("id", id)
    } catch {
      /* the row stays, the next load re-syncs it */
    }
  }, [])

  const clear = useCallback(async () => {
    writeLocal([])
    setItems([])

    const supabase = supabaseRef.current
    const userId = userIdRef.current
    if (!userId) return
    try {
      await supabase.from("mockify_generations").delete().eq("user_id", userId)
    } catch {
      /* ignore, the next load re-syncs */
    }
  }, [])

  return { items, add, remove, clear, isLoading, mode }
}
