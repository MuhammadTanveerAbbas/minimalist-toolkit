"use client"

import { useCallback, useRef, useState } from "react"
import { Send, Loader2, Trash2 } from "lucide-react"

type Msg = { role: "user" | "assistant"; content: string }

export default function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || isLoading) return
    const nextMessages: Msg[] = [...messages, { role: "user", content: text }]
    setMessages(nextMessages)
    setInput("")
    setError(null)
    setIsLoading(true)
    let assistant = ""

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      })

      if (!res.ok || !res.body) {
        let msg = `Request failed (${res.status})`
        try {
          const data = await res.json()
          if (data?.error) msg = data.error
        } catch {}
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
          } catch {}
        }
      }
      if (!assistant) throw new Error("No response was returned.")
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.")
      if (!assistant) setMessages(nextMessages)
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages])

  return (
    <div className="mx-auto flex h-[calc(100dvh-3.5rem-5.5rem)] w-full max-w-5xl flex-col px-4 py-4 sm:px-6 md:h-[calc(100dvh-3.5rem-1.5rem)] lg:px-8">
      <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">AI chat</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Short, clear help for code and prompts.</p>
        </div>
        {messages.length > 0 ? (
          <button
            type="button"
            onClick={() => { setMessages([]); setError(null) }}
            className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            <Trash2 className="h-4 w-4" /> <span className="hidden sm:inline">Clear</span>
          </button>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto py-4">
        {messages.length === 0 ? (
          <div className="animate-fade-up rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-medium">Ask anything</p>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
              Get short, clear help with code, prompts, or ideas.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[min(100%,42rem)] rounded-xl border px-3 py-2.5 text-sm leading-6 whitespace-pre-wrap ${m.role === "user" ? "border-border bg-foreground text-background" : "border-border bg-card text-foreground"}`}>
                  {m.content || (isLoading && i === messages.length - 1 ? "Thinking..." : "")}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {error ? <p className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">{error}</p> : null}

      <form
        className="border-t border-border pt-3"
        onSubmit={(e) => { e.preventDefault(); void send() }}
      >
        <div className="flex items-end gap-2">
          <label htmlFor="chat-input" className="sr-only">Message</label>
          <textarea
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send() }
            }}
            placeholder="Message..."
            className="h-11 w-full resize-none overflow-y-auto rounded-lg border border-border bg-background px-3 py-2.5 text-sm leading-5 focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-foreground text-background transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">Enter to send. Shift+Enter for a new line.</p>
      </form>
    </div>
  )
}
