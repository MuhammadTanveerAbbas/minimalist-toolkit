"use client"

const BAR_COUNT = 20

export function WaveLoader() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5" role="status" aria-live="polite">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-foreground/50 animate-pulse"
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">Generating image...</span>
      </div>
      <div className="flex h-16 items-end justify-center gap-1 rounded-lg border border-border bg-background p-3" aria-hidden="true">
        {Array.from({ length: BAR_COUNT }).map((_, i) => {
          const envelope = Math.sin((i / (BAR_COUNT - 1)) * Math.PI)
          const maxH = Math.round(8 + envelope * 28)
          return (
            <div
              key={i}
              className="w-1.5 rounded-full bg-foreground/25 animate-pulse"
              style={{
                height: maxH,
                animationDelay: `${Math.round((i / BAR_COUNT) * 600)}ms`,
              }}
            />
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground">This can take a moment depending on the selected model and service load.</p>
    </div>
  )
}
