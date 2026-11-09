"use client"

import { useState, useRef, useCallback } from "react"
import { PromptForm, type GenerateParams } from "@/components/promptcraft/prompt-form"
import { PromptOutput } from "@/components/promptcraft/prompt-output"
import { PromptHistory, type HistoryItem } from "@/components/promptcraft/prompt-history"
import { Clock, X } from "lucide-react"

export function PromptCraftTool() {
  const [output, setOutput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [canRegenerate, setCanRegenerate] = useState(false)

  const lastParams = useRef<GenerateParams | null>(null)

  const readStream = useCallback(
    async (
      url: string,
      body: Record<string, string>,
      setLoadingFn: (v: boolean) => void,
      clearFirst: boolean,
      onFinish?: (text: string) => void
    ) => {
      setLoadingFn(true)
      setError(null)
      if (clearFirst) setOutput("")
      let fullText = ""

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })

        if (!res.ok || !res.body) {
          let errMessage = `Request failed (${res.status})`
          const raw = await res.text().catch(() => "")
          if (raw) {
            try {
              const errData = JSON.parse(raw)
              if (errData?.error) errMessage = errData.error
            } catch {
              errMessage = raw
            }
          }
          throw new Error(errMessage)
        }

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
            const colonIdx = line.indexOf(":")
            if (colonIdx === -1) continue
            const typeCode = line.slice(0, colonIdx)
            const rawValue = line.slice(colonIdx + 1)

            if (typeCode === "0") {
              try {
                const chunk = JSON.parse(rawValue)
                if (typeof chunk === "string") {
                  fullText += chunk
                  setOutput(fullText)
                }
              } catch {
                fullText += rawValue
                setOutput(fullText)
              }
            }
          }
        }

        if (!fullText) throw new Error("No content was returned. Please try again.")
        onFinish?.(fullText)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong. Please try again."
        setError(message)
        if (!fullText) setOutput("")
      } finally {
        setLoadingFn(false)
      }
    },
    []
  )

  const handleGenerate = useCallback(
    async (params: GenerateParams) => {
      lastParams.current = params
      await readStream("/api/promptcraft/generate", params as unknown as Record<string, string>, setIsLoading, true, (text) => {
        if (!text) return
        setCanRegenerate(true)
        setHistory((prev) => [
          {
            id: crypto.randomUUID(),
            topic: params.topic,
            category: params.category,
            tone: params.tone,
            platform: params.platform,
            output: text,
            timestamp: new Date(),
          },
          ...prev.slice(0, 19),
        ])
      })
    },
    [readStream]
  )

  const handleRegenerate = useCallback(() => {
    if (!lastParams.current) return
    handleGenerate(lastParams.current)
  }, [handleGenerate])

  const handleEnhance = useCallback(async () => {
    if (!output) return
    await readStream("/api/promptcraft/enhance", { prompt: output }, setIsEnhancing, true)
  }, [output, readStream])

  const handleSelectHistory = useCallback((item: HistoryItem) => {
    setOutput(item.output)
    setError(null)
    setShowHistory(false)
  }, [])

  const handleDeleteHistory = useCallback((id: string) => {
    setHistory((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const handleClearHistory = useCallback(() => {
    setHistory([])
  }, [])

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">PromptCraft</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Write, generate, and improve prompts with a simple workflow.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          aria-label={showHistory ? "Close history" : "Open history"}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
        >
          {showHistory ? <X className="h-4 w-4" aria-hidden="true" /> : <Clock className="h-4 w-4" aria-hidden="true" />}
          <span>{showHistory ? "Close" : "History"}</span>
          {!showHistory && history.length > 0 ? (
            <span className="rounded-md border border-border bg-card px-1.5 py-0.5 text-[11px] text-foreground">{history.length}</span>
          ) : null}
        </button>
      </div>

      {showHistory ? (
        <div className="mx-auto max-w-3xl animate-fade-up">
          <div className="mb-4 rounded-xl border border-border bg-card p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">History</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {history.length} prompt{history.length !== 1 ? "s" : ""} in this session
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="h-9 rounded-lg border border-border px-3 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
              >
                Back
              </button>
            </div>
            <PromptHistory items={history} onSelect={handleSelectHistory} onDelete={handleDeleteHistory} onClearAll={handleClearHistory} />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2 xl:items-start">
          <div className="rounded-xl border border-border bg-card">
            <PromptForm onGenerate={handleGenerate} isLoading={isLoading} />
          </div>
          <div className="rounded-xl border border-border bg-card xl:sticky xl:top-20">
            <PromptOutput
              output={output}
              isLoading={isLoading}
              isEnhancing={isEnhancing}
              error={error}
              onEnhance={handleEnhance}
              onRegenerate={handleRegenerate}
              canRegenerate={canRegenerate}
            />
          </div>
        </div>
      )}
    </div>
  )
}
