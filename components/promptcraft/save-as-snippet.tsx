"use client"

import { useState } from "react"
import { BookmarkPlus, Check, Loader2, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

export interface SnippetSource {
  /** Used for the snippet title and description. */
  topic: string
  /** The generated prompt body, stored as the snippet code. */
  output: string
  /** Optional platform, lower-cased into the tags list. */
  platform?: string
}

export type SaveSnippetState = "idle" | "saving" | "saved" | "error"

/**
 * Saves a generated prompt into `public.snippets` as a private markdown
 * snippet, so it can be reopened later from the Snippet Manager.
 */
export function SaveAsSnippetButton({
  source,
  className,
}: {
  source: SnippetSource
  className?: string
}) {
  const [state, setState] = useState<SaveSnippetState>("idle")
  const [message, setMessage] = useState<string | null>(null)

  const handleSave = async () => {
    if (state === "saving") return
    setState("saving")
    setMessage(null)

    try {
      const supabase = createClient()
      const { data: userData, error: userError } = await supabase.auth.getUser()
      const user = userData?.user
      if (userError || !user) {
        setState("error")
        setMessage("Sign in to save prompts as snippets.")
        return
      }

      const title = source.topic.trim() || "Untitled prompt"
      const tags = ["prompt"]
      if (source.platform?.trim()) {
        tags.push(source.platform.trim().toLowerCase())
      }

      const { error } = await supabase.from("snippets").insert({
        user_id: user.id,
        title: title.slice(0, 200),
        description: source.topic.trim(),
        code: source.output,
        language: "markdown",
        tags,
        category: "Prompts",
        visibility: "private",
        versions: [],
      })

      if (error) {
        setState("error")
        setMessage(error.message)
        return
      }

      setState("saved")
      setMessage("Saved to Snippets.")
    } catch (err) {
      setState("error")
      setMessage(err instanceof Error ? err.message : "Could not save the snippet.")
    }
  }

  const label =
    state === "saving"
      ? "Saving..."
      : state === "saved"
        ? "Saved"
        : state === "error"
          ? "Retry save"
          : "Save as snippet"

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <button
        type="button"
        onClick={handleSave}
        disabled={state === "saving" || state === "saved"}
        className={cn(
          "flex min-h-11 items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition-all",
          "border-border/70 bg-secondary/40 text-muted-foreground hover:border-border hover:bg-secondary hover:text-foreground",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        {state === "saving" ? (
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
        ) : state === "saved" ? (
          <Check className="h-3 w-3 text-success" aria-hidden="true" />
        ) : (
          <BookmarkPlus className="h-3 w-3" aria-hidden="true" />
        )}
        <span className="hidden sm:inline">{label}</span>
      </button>
      {message && state === "error" && (
        <p
          role="alert"
          className="flex items-start gap-1 text-[11px] leading-4 text-destructive-foreground"
        >
          <AlertCircle className="mt-px h-3 w-3 shrink-0" aria-hidden="true" />
          {message}
        </p>
      )}
    </div>
  )
}
