import { Code2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="space-y-3 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card animate-pulse">
          <Code2 className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
