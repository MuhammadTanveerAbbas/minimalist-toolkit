"use client"

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import {
  Check,
  Copy,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Send,
  Sparkles,
  Trash2,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Msg = { role: "user" | "assistant"; content: string }

const STARTERS = [
  "Explain the difference between a UUID and a ULID for database primary keys",
  "Write a SQL query that finds duplicate email addresses in a users table",
  "Give me three prompt variations for a developer tool launch announcement",
  "How should I structure a pricing page with a free tier and two paid plans?",
]

const STORAGE_KEY = "toolkit_chat_history"

function parseHistory(raw: string | null): Msg[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (m): m is Msg =>
        Boolean(m) &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
    )
  } catch {
    return []
  }
}

/**
 * A small external store for the conversation. It keeps a stable snapshot
 * reference so React can compare it between renders, and persists to
 * localStorage on a debounce so streaming does not hammer storage.
 */
class ChatHistoryStore {
  private snapshot: Msg[] = []
  private raw: string | null = null
  private loaded = false
  private listeners = new Set<() => void>()
  private persistTimer: ReturnType<typeof setTimeout> | null = null

  subscribe = (onChange: () => void) => {
    this.listeners.add(onChange)
    return () => {
      this.listeners.delete(onChange)
    }
  }

  getSnapshot = (): Msg[] => {
    if (!this.loaded) {
      this.loaded = true
      try {
        this.raw = window.localStorage.getItem(STORAGE_KEY)
      } catch {
        this.raw = null
      }
      this.snapshot = parseHistory(this.raw)
    }
    return this.snapshot
  }

  getServerSnapshot = (): Msg[] => []

  private emit() {
    this.listeners.forEach((listener) => listener())
  }

  set = (updater: Msg[] | ((prev: Msg[]) => Msg[])) => {
    const current = this.getSnapshot()
    const next = typeof updater === "function" ? updater(current) : updater
    if (next === current) return
    this.snapshot = next
    this.emit()
    this.schedulePersist()
  }

  private schedulePersist() {
    if (this.persistTimer) clearTimeout(this.persistTimer)
    this.persistTimer = setTimeout(() => {
      this.persistTimer = null
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.snapshot.slice(-40)))
      } catch {
        // Storage may be unavailable. The conversation still works in memory.
      }
    }, 400)
  }
}

const chatHistory = new ChatHistoryStore()

export default function ChatPage() {
  const messages = useSyncExternalStore(
    chatHistory.subscribe,
    chatHistory.getSnapshot,
    chatHistory.getServerSnapshot
  )
  const setMessages = chatHistory.set
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages])

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  const send = useCallback(
    async (override?: string) => {
      const text = (override ?? input).trim()
      if (!text || isLoading) return

      const nextMessages: Msg[] = [...messages, { role: "user", content: text }]
      setMessages(nextMessages)
      setInput("")
      setError(null)
      setIsLoading(true)
      let assistant = ""

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: nextMessages }),
          signal: controller.signal,
        })

        if (!res.ok || !res.body) {
          let msg = `Request failed (${res.status})`
          try {
            const data = await res.json()
            if (data?.error) msg = data.error
          } catch {
            // Keep the status-based message
          }
          throw new Error(msg)
        }

        setMessages((prev) => [...prev, { role: "assistant", content: "" }])
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() ?? ""

          for (const line of lines) {
            if (!line.trim()) continue
            const i = line.indexOf(":")
            if (i === -1) continue
            if (line.slice(0, i) !== "0") continue
            try {
              const chunk = JSON.parse(line.slice(i + 1))
              if (typeof chunk === "string") {
                assistant += chunk
                setMessages((prev) => {
                  const copy = [...prev]
                  copy[copy.length - 1] = { role: "assistant", content: assistant }
                  return copy
                })
              }
            } catch {
              // Skip malformed stream chunks
            }
          }
        }

        if (!assistant) throw new Error("No response was returned.")
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") {
          // The user stopped the response. Keep whatever arrived.
        } else {
          setError(e instanceof Error ? e.message : "Something went wrong.")
        }
        if (!assistant) setMessages(nextMessages)
      } finally {
        abortRef.current = null
        setIsLoading(false)
      }
    },
    [input, isLoading, messages, setMessages]
  )

  const regenerate = useCallback(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user")
    if (!lastUser) return
    setMessages(messages.slice(0, messages.lastIndexOf(lastUser) + 1).slice(0, -1))
    window.setTimeout(() => void send(lastUser.content), 0)
  }, [messages, send, setMessages])

  const copyMessage = useCallback(async (index: number, content: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedIndex(index)
    window.setTimeout(() => setCopiedIndex(null), 1800)
  }, [])

  const clearAll = useCallback(() => {
    abortRef.current?.abort()
    setMessages([])
    setError(null)
  }, [setMessages])

  const hasMessages = messages.length > 0

  const stats = useMemo(() => {
    const words = messages.reduce(
      (sum, m) => sum + m.content.split(/\s+/).filter(Boolean).length,
      0
    )
    return { messages: messages.length, words }
  }, [messages])

  return (
    <div className="mx-auto flex h-[calc(100dvh-3.5rem-4rem)] w-full max-w-4xl flex-col px-4 py-4 sm:px-6 md:h-[calc(100dvh-3.5rem-1.5rem)] lg:px-8">
      <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">AI Chat</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Short, clear answers on code, prompts and product decisions.
          </p>
        </div>
        {hasMessages ? (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground transition-colors duration-150 hover:border-destructive/40 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-4">
        {!hasMessages ? (
          <div className="rounded-xl border border-border bg-card p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-2">
              <Sparkles className="h-4 w-4 text-brand" aria-hidden="true" />
            </span>
            <h2 className="mt-3 text-sm font-semibold">Ask anything</h2>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
              Useful for code review, SQL, prompt writing, copy drafts and product trade-offs. Answers stay
              short and plain.
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {STARTERS.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => void send(starter)}
                  className="rounded-lg border border-border bg-surface-2 p-3 text-left text-xs leading-5 text-muted-foreground transition-colors hover:border-foreground/25 hover:bg-card hover:text-foreground"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex gap-2.5", m.role === "user" ? "justify-end" : "justify-start")}>
                {m.role === "assistant" ? (
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
                    <Sparkles className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                  </span>
                ) : null}

                <div
                  className={cn(
                    "group max-w-[min(100%,38rem)] whitespace-pre-wrap rounded-xl border px-3.5 py-2.5 text-sm leading-6",
                    m.role === "user"
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-foreground"
                  )}
                >
                  {m.content ||
                    (isLoading && i === messages.length - 1 ? (
                      <span className="inline-flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                        Thinking...
                      </span>
                    ) : null)}
                </div>

                {m.role === "assistant" && m.content ? (
                  <div className="mt-0.5 flex shrink-0 flex-col gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => void copyMessage(i, m.content)}
                      aria-label="Copy this answer"
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      {copiedIndex === i ? (
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                ) : null}

                {m.role === "user" ? (
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
                    <User className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  </span>
                ) : null}
              </div>
            ))}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {error ? (
        <div
          role="alert"
          className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2"
        >
          <p className="min-w-0 flex-1 text-sm text-destructive">{error}</p>
          <button
            type="button"
            onClick={regenerate}
            className="inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-lg border border-destructive/30 px-2.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <RefreshCw className="h-3 w-3" aria-hidden="true" />
            Try again
          </button>
        </div>
      ) : null}

      <form className="border-t border-border pt-3" onSubmit={(e) => { e.preventDefault(); void send() }}>
        <div className="flex items-end gap-2">
          <label htmlFor="chat-input" className="sr-only">
            Message
          </label>
          <textarea
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                void send()
              }
            }}
            rows={1}
            placeholder="Ask a question..."
            className="max-h-40 min-h-11 w-full resize-y rounded-lg border border-border bg-background px-3 py-2.5 text-sm leading-5 transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
          {isLoading ? (
            <button
              type="button"
              onClick={() => abortRef.current?.abort()}
              aria-label="Stop generating"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-card transition-colors hover:bg-accent"
            >
              <span className="h-3.5 w-3.5 rounded-sm bg-foreground" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send message"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-foreground text-background transition-opacity duration-150 hover:opacity-90 disabled:opacity-40"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>Enter to send. Shift+Enter for a new line.</span>
          {hasMessages ? (
            <span className="tabular-nums">
              {stats.messages} messages · {stats.words} words
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <MessageSquareText className="h-3 w-3" aria-hidden="true" />
              History saved in this browser
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
