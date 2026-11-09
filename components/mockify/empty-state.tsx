import { ImageIcon } from "lucide-react"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card py-12 text-center px-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background">
        <ImageIcon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">No image yet</p>
        <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">
          Describe what you want to create, choose your settings, then generate an image.
        </p>
      </div>
    </div>
  )
}
