import Link from "next/link"
import { Command, FileQuestion } from "lucide-react"
import { TOOLS } from "@/lib/navigation"

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-lg space-y-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card">
          <FileQuestion className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Page not found</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            The page you were looking for does not exist or has moved.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Go to a tool
          </p>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {TOOLS.map((tool) => (
              <li key={tool.id}>
                <Link
                  href={tool.href}
                  className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <tool.icon className="h-4 w-4 shrink-0" style={{ color: tool.accent }} aria-hidden="true" />
                  <span className="truncate">{tool.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col justify-center gap-2 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            <Command className="h-4 w-4" aria-hidden="true" />
            Go home
          </Link>
          <Link
            href="/app/dashboard"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-accent"
          >
            Open workspace
          </Link>
        </div>
      </div>
    </div>
  )
}
