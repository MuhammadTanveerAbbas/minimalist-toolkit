"use client"

import { useState, useEffect } from "react"
import {
  Download,
  Copy,
  Check,
  Maximize2,
  X,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { buildImageFilename } from "@/lib/mockify/filename"

interface MockupResultProps {
  imageUrl: string
  prompt: string
  seed?: number | null
  onNewVariation?: () => void
  isGenerating?: boolean
}

// Lifted outside component so React doesn't remount it on every render
function ImageFrame({
  imageUrl,
  prompt,
  inModal = false,
  zoomed = false,
  onToggleZoom,
}: {
  imageUrl: string
  prompt: string
  inModal?: boolean
  zoomed?: boolean
  onToggleZoom?: () => void
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card w-full shadow-lg shadow-black/30">
      {/* eslint-disable-next-line @next/next/no-img-element -- blob/data/generated URLs */}
      <img
        src={imageUrl}
        alt={`Generated mockup: ${prompt}`}
        className={cn(
          "w-full h-auto object-contain transition-transform duration-300",
          "max-w-full",
          inModal && zoomed ? "scale-150 cursor-zoom-out" : inModal ? "cursor-zoom-in" : ""
        )}
        style={{
          imageRendering: "auto",
          objectFit: "contain",
          display: "block",
        }}
        onClick={inModal ? onToggleZoom : undefined}
        draggable={false}
      />
    </div>
  )
}

export function MockupResult({
  imageUrl,
  prompt,
  seed,
  onNewVariation,
  isGenerating = false,
}: MockupResultProps) {
  const [copied, setCopied] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [zoomed, setZoomed] = useState(false)

  // Close on Escape
  useEffect(() => {
    if (!fullscreen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setFullscreen(false); setZoomed(false) }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [fullscreen])

  // Prevent body scroll when fullscreen
  useEffect(() => {
    document.body.style.overflow = fullscreen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [fullscreen])

  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = buildImageFilename(prompt)
    link.target = "_blank"
    link.click()
  }

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Action row */}
        <div className="flex items-center justify-end gap-2 flex-wrap">
          {onNewVariation && (
            <button
              type="button"
              onClick={onNewVariation}
              disabled={isGenerating}
              className="flex min-h-11 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:border-ring transition-colors font-mono disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">New variation</span>
              <span className="sm:hidden">Variation</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleCopyPrompt}
            className="flex min-h-11 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:border-ring transition-colors font-mono"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-accent" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy prompt"}</span>
            <span className="sm:hidden">{copied ? "Copied" : "Copy"}</span>
          </button>
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="flex min-h-11 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:border-ring transition-colors font-mono"
          >
            <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">Fullscreen</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex min-h-11 items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-medium hover:opacity-90 transition-opacity"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Download
          </button>
        </div>

        <div className="w-full">
          <ImageFrame imageUrl={imageUrl} prompt={prompt} />
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-xs font-mono text-muted-foreground leading-relaxed wrap-break-word">
            <span className="text-accent mr-1">›</span>
            {prompt}
          </p>
          {seed != null && (
            <p className="text-[10px] font-mono text-muted-foreground/60">
              seed {seed}
            </p>
          )}
        </div>
      </div>

      {/* Fullscreen lightbox */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-background animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) { setFullscreen(false); setZoomed(false) } }}
        >
          {/* Toolbar */}
          <div className="flex shrink-0 items-center justify-end border-b border-border px-5 py-3 gap-2">
            <button
              type="button"
              onClick={() => setZoomed((z) => !z)}
              className="flex min-h-11 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:border-ring transition-colors font-mono"
            >
              {zoomed ? <ZoomOut className="h-3.5 w-3.5" aria-hidden="true" /> : <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />}
              {zoomed ? "Zoom out" : "Zoom in"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex min-h-11 items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-medium hover:opacity-90 transition-opacity"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Download
            </button>
            <button
              type="button"
              onClick={() => { setFullscreen(false); setZoomed(false) }}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground hover:border-ring transition-colors"
              title="Close (Esc)"
              aria-label="Close fullscreen view"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Image area */}
          <div className="flex flex-1 overflow-auto items-start justify-center p-6">
            <div className="w-full max-w-6xl">
              <ImageFrame
                imageUrl={imageUrl}
                prompt={prompt}
                inModal
                zoomed={zoomed}
                onToggleZoom={() => setZoomed((z) => !z)}
              />
            </div>
          </div>

          {/* Prompt bar */}
          <div className="shrink-0 border-t border-border px-5 py-3">
            <p className="text-xs font-mono text-muted-foreground leading-relaxed truncate">
              <span className="text-accent mr-1">›</span>{prompt}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
