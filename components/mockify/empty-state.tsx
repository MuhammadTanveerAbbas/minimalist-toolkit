import { ImageIcon, Wand2 } from "lucide-react"

interface EmptyStateProps {
  /** Primary action: focus the prompt field so the user can start typing. */
  onStart?: () => void
}

export function EmptyState({ onStart }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card px-4 py-12 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background">
        <ImageIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="max-w-sm">
        <p className="text-sm font-medium text-foreground">No image yet</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Describe what you want to create, choose your settings, then generate an
          image. Every generation is saved to your history so you can compare
          results later.
        </p>
      </div>
      {onStart && (
        <button
          type="button"
          onClick={onStart}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-ring hover:text-foreground"
        >
          <Wand2 className="h-3.5 w-3.5" aria-hidden="true" />
          Start with a prompt
        </button>
      )}
    </div>
  )
}
