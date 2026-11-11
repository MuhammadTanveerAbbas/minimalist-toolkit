"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"

/**
 * A user-owned document stored either in Supabase (preferred) or in
 * localStorage (fallback when the database is unreachable or the
 * `tool_documents` migration has not been applied yet).
 *
 * Both new tools share this so saving, listing, updating and deleting
 * behave identically across the workspace.
 */
export interface ToolDocument<T> {
  id: string
  title: string
  data: T
  createdAt: string
  updatedAt: string
}

export type StorageMode = "database" | "local" | "loading"

interface Row {
  id: string
  title: string
  data: unknown
  created_at: string
  updated_at: string
}

function localKey(tool: string) {
  return `toolkit_${tool}_documents`
}

function readLocal<T>(tool: string): ToolDocument<T>[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(localKey(tool))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (d): d is ToolDocument<T> =>
        Boolean(d) && typeof d.id === "string" && typeof d.title === "string" && d.data !== undefined
    )
  } catch {
    return []
  }
}

function writeLocal<T>(tool: string, docs: ToolDocument<T>[]) {
  try {
    window.localStorage.setItem(localKey(tool), JSON.stringify(docs))
  } catch {
    // Storage may be unavailable (private mode, quota). Failing silently
    // keeps the tool usable in-memory for the current session.
  }
}

function isMissingTable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  const code = error.code ?? ""
  const message = (error.message ?? "").toLowerCase()
  return (
    code === "42P01" ||
    code === "PGRST205" ||
    code === "42883" ||
    message.includes("does not exist") ||
    message.includes("relation") ||
    message.includes("not found")
  )
}

export function useToolDocuments<T extends { id: string }>(tool: string) {
  const [documents, setDocuments] = useState<ToolDocument<T>[]>([])
  const [mode, setMode] = useState<StorageMode>("loading")
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])
  const userIdRef = useRef<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user
    if (!user) {
      setDocuments(readLocal<T>(tool))
      setMode("local")
      return
    }
    userIdRef.current = user.id

    const { data, error: queryError } = await supabase
      .from("tool_documents")
      .select("id, title, data, created_at, updated_at")
      .eq("tool", tool)
      .order("updated_at", { ascending: false })

    if (queryError) {
      // The table may not exist yet, or the network may be down. Fall back to
      // local storage so the tool stays fully usable either way.
      setDocuments(readLocal<T>(tool))
      setMode("local")
      if (!isMissingTable(queryError)) {
        setError(queryError.message)
      }
      return
    }

    const rows = (data ?? []) as Row[]
    const mapped: ToolDocument<T>[] = rows.map((row) => ({
      id: row.id,
      title: row.title,
      data: row.data as T,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
    setDocuments(mapped)
    setMode("database")
  }, [supabase, tool])

  useEffect(() => {
    let active = true
    void (async () => {
      await load()
      if (!active) return
    })()
    return () => {
      active = false
    }
  }, [load])

  const persistLocal = useCallback(
    (next: ToolDocument<T>[]) => {
      setDocuments(next)
      writeLocal(tool, next)
    },
    [tool]
  )

  const create = useCallback(
    async (title: string, data: T): Promise<ToolDocument<T>> => {
      const now = new Date().toISOString()
      const doc: ToolDocument<T> = {
        id: crypto.randomUUID(),
        title,
        data,
        createdAt: now,
        updatedAt: now,
      }

      const userId = userIdRef.current
      if (userId && mode === "database") {
        const { data: row, error: insertError } = await supabase
          .from("tool_documents")
          .insert({ id: doc.id, user_id: userId, tool, title, data })
          .select("id, title, data, created_at, updated_at")
          .single()

        if (!insertError && row) {
          const saved: ToolDocument<T> = {
            id: row.id,
            title: row.title,
            data: row.data as T,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }
          setDocuments((prev) => [saved, ...prev])
          writeLocal(
            tool,
            [saved, ...readLocal<T>(tool)]
          )
          return saved
        }
        if (insertError && !isMissingTable(insertError)) {
          setError(insertError.message)
        }
      }

      persistLocal([doc, ...readLocal<T>(tool)])
      return doc
    },
    [mode, persistLocal, supabase, tool]
  )

  const update = useCallback(
    async (id: string, patch: { title?: string; data?: T }): Promise<void> => {
      const existing = documents.find((d) => d.id === id)
      if (!existing) return
      const now = new Date().toISOString()
      const next: ToolDocument<T> = {
        ...existing,
        title: patch.title ?? existing.title,
        data: patch.data ?? existing.data,
        updatedAt: now,
      }

      const userId = userIdRef.current
      if (userId && mode === "database") {
        const { error: updateError } = await supabase
          .from("tool_documents")
          .update({ title: next.title, data: next.data, updated_at: now })
          .eq("id", id)
        if (!updateError) {
          setDocuments((prev) => prev.map((d) => (d.id === id ? next : d)))
          writeLocal(
            tool,
            readLocal<T>(tool).map((d) => (d.id === id ? next : d))
          )
          return
        }
        if (!isMissingTable(updateError)) setError(updateError.message)
      }

      persistLocal(readLocal<T>(tool).map((d) => (d.id === id ? next : d)))
      setDocuments((prev) => prev.map((d) => (d.id === id ? next : d)))
    },
    [documents, mode, persistLocal, supabase, tool]
  )

  const remove = useCallback(
    async (id: string): Promise<void> => {
      const userId = userIdRef.current
      if (userId && mode === "database") {
        const { error: deleteError } = await supabase.from("tool_documents").delete().eq("id", id)
        if (!deleteError) {
          setDocuments((prev) => prev.filter((d) => d.id !== id))
          writeLocal(
            tool,
            readLocal<T>(tool).filter((d) => d.id !== id)
          )
          return
        }
        if (!isMissingTable(deleteError)) setError(deleteError.message)
      }

      persistLocal(readLocal<T>(tool).filter((d) => d.id !== id))
      setDocuments((prev) => prev.filter((d) => d.id !== id))
    },
    [mode, persistLocal, supabase, tool]
  )

  const refresh = useCallback(async () => {
    await load()
  }, [load])

  return { documents, mode, error, create, update, remove, refresh, setError }
}
