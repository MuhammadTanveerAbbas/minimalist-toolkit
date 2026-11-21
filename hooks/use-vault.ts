"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export type VaultKind = "skill" | "prompt" | "plugin"

export interface VaultItem {
  id: string
  kind: VaultKind
  title: string
  description: string
  content: string
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface VaultInput {
  kind: VaultKind
  title: string
  description: string
  content: string
  category: string
  tags: string[]
}

function dbToItem(row: any): VaultItem {
  return {
    id: row.id,
    kind: row.kind as VaultKind,
    title: row.title ?? "",
    description: row.description ?? "",
    content: row.content ?? "",
    category: row.category ?? "",
    tags: Array.isArray(row.tags) ? row.tags : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function useVault() {
  const supabase = useMemo(() => createClient(), [])
  const [items, setItems] = useState<VaultItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    let mounted = true

    async function load() {
      const { data } = await supabase.auth.getUser()
      const user = data?.user ?? null
      if (!user) {
        if (mounted) {
          setItems([])
          setIsLoaded(true)
        }
        return
      }

      const { data: rows, error } = await supabase
        .from("vault_items")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (!mounted) return
      if (!error) setItems((rows ?? []).map(dbToItem))
      setIsLoaded(true)
    }

    void load()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      void load()
    })
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const createItem = useCallback(
    async (input: VaultInput) => {
      const { data } = await supabase.auth.getUser()
      const user = data?.user ?? null
      if (!user) throw new Error("Not authenticated")

      const { data: row, error } = await supabase
        .from("vault_items")
        .insert({
          user_id: user.id,
          kind: input.kind,
          title: input.title,
          description: input.description,
          content: input.content,
          category: input.category,
          tags: input.tags,
        })
        .select()
        .single()

      if (error) throw error
      const item = dbToItem(row)
      setItems((prev) => [item, ...prev])
      return item
    },
    [supabase]
  )

  const updateItem = useCallback(
    async (id: string, input: VaultInput) => {
      const { data: row, error } = await supabase
        .from("vault_items")
        .update({
          kind: input.kind,
          title: input.title,
          description: input.description,
          content: input.content,
          category: input.category,
          tags: input.tags,
        })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      const item = dbToItem(row)
      setItems((prev) => prev.map((entry) => (entry.id === id ? item : entry)))
      return item
    },
    [supabase]
  )

  const deleteItem = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("vault_items").delete().eq("id", id)
      if (error) throw error
      setItems((prev) => prev.filter((entry) => entry.id !== id))
    },
    [supabase]
  )

  const categories = useMemo(
    () => Array.from(new Set(items.map((item) => item.category).filter(Boolean))).sort(),
    [items]
  )

  const counts = useMemo(
    () => ({
      total: items.length,
      skill: items.filter((item) => item.kind === "skill").length,
      prompt: items.filter((item) => item.kind === "prompt").length,
      plugin: items.filter((item) => item.kind === "plugin").length,
    }),
    [items]
  )

  return { items, isLoaded, categories, counts, createItem, updateItem, deleteItem }
}
