"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertCircle, Command, RotateCw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md space-y-5 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card">
          <AlertCircle className="h-6 w-6 text-destructive" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Something went wrong</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            An unexpected error interrupted this page. Your saved data is unaffected.
          </p>
          {error.digest ? (
            <p className="mt-2 font-mono text-[11px] text-muted-foreground/70">
              Reference {error.digest}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col justify-center gap-2 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            <RotateCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>
          <Link
            href="/app/dashboard"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-accent"
          >
            <Command className="h-4 w-4" aria-hidden="true" />
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
