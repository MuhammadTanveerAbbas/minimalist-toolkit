"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"

/** localStorage key used when the database is unavailable or the user is signed out */
export const PROMPTCRAFT_HISTORY_KEY = "promptcraft_history"

/** Maximum number of prompts kept per store */
export const MAX_HISTORY = 20

export type HistoryMode = "database" | "local"

export interface HistoryItem {
  id: string
  topic: string
  category: string
  tone: string
  platform: string
  output: string
  timestamp: Date
}

interface DbRow {
  id: string
  topic: string
  category: string | null
  tone: string | null
  platform: string | null
  output: string
  created_at: string
}

interface StoredItem {
  id: string
  topic: string
  category: string
  tone: string
  platform: string
  output: string
  timestamp: string
}

function readLocal(): HistoryItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(PROMPTCRAFT_HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StoredItem[]
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (item) =>
          item &&
          typeof item.id === "string" &&
          typeof item.topic === "string" &&
          typeof item.output === "string"
      )
      .map((item) => ({
        id: item.id,
        topic: item.topic,
        category: item.category ?? "",
        tone: item.tone ?? "",
        platform: item.platform ?? "",
        output: item.output,
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
    topic: item.topic,
    category: item.category,
    tone: item.tone,
    platform: item.platform,
    output: item.output,
    timestamp: item.timestamp.toISOString(),
  }))
  return JSON.stringify(stored)
}

function writeLocal(items: HistoryItem[]): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(PROMPTCRAFT_HISTORY_KEY, serialize(items))
  } catch {
    /* storage unavailable or quota exceeded, keep the in-memory list working */
  }
}

function byNewest(a: HistoryItem, b: HistoryItem): number {
  return b.timestamp.getTime() - a.timestamp.getTime()
}

/**
 * Database rows are authoritative; local-only entries (written while signed
 * out) are kept so nothing is lost.
 */
function mergeSources(rows: DbRow[], local: HistoryItem[]): HistoryItem[] {
  const seen = new Set<string>()
  const merged: HistoryItem[] = []

  for (const row of rows) {
    seen.add(row.id)
    merged.push({
      id: row.id,
      topic: row.topic,
      category: row.category ?? "",
      tone: row.tone ?? "",
      platform: row.platform ?? "",
      output: row.output,
      timestamp: new Date(row.created_at),
    })
  }

  for (const item of local) {
    if (seen.has(item.id)) continue
    merged.push(item)
  }

  return merged.sort(byNewest).slice(0, MAX_HISTORY)
}

/**
 * PromptCraft prompt history.
 *
 * Prompts are stored in `public.promptcraft_history` for signed-in users.
 * When the user is signed out, or the table has not been created yet, the
 * hook falls back to localStorage so the tool never appears broken.
 */
export function usePromptCraftHistory() {
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
        .from("promptcraft_history")
        .select("id, topic, category, tone, platform, output, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(MAX_HISTORY)

      if (error) {
        // The migration may not be applied yet. Fall back to localStorage.
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
        window.setTimeout(() => void load(), 0)
      }
    })
    return () => data.subscription.unsubscribe()
  }, [load])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== PROMPTCRAFT_HISTORY_KEY) return
      setItems(mergeSources(dbRowsRef.current, readLocal()))
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const add = useCallback(async (item: HistoryItem) => {
    const nextLocal = [item, ...readLocal().filter((i) => i.id !== item.id)].slice(0, MAX_HISTORY)
    writeLocal(nextLocal)
    setItems((prev) =>
      [item, ...prev.filter((i) => i.id !== item.id)].sort(byNewest).slice(0, MAX_HISTORY)
    )

    const supabase = supabaseRef.current
    const userId = userIdRef.current
    if (!userId) return

    try {
      const { error } = await supabase.from("promptcraft_history").insert({
        id: item.id,
        user_id: userId,
        topic: item.topic,
        category: item.category,
        tone: item.tone,
        platform: item.platform,
        output: item.output,
        created_at: item.timestamp.toISOString(),
      })
      if (error) setMode("local")
    } catch {
      setMode("local")
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    writeLocal(readLocal().filter((item) => item.id !== id))
    setItems((prev) => prev.filter((item) => item.id !== id))

    const supabase = supabaseRef.current
    if (!userIdRef.current) return
    try {
      await supabase.from("promptcraft_history").delete().eq("id", id)
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
      await supabase.from("promptcraft_history").delete().eq("user_id", userId)
    } catch {
      /* ignore, the next load re-syncs */
    }
  }, [])

  return { items, add, remove, clear, isLoading, mode }
}
