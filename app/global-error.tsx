'use client'

import './globals.css'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-8 text-foreground">
          <div className="w-full max-w-sm space-y-4 text-center">
            <h1 className="text-lg font-semibold tracking-tight">Something went wrong</h1>
            <p className="text-sm leading-6 text-muted-foreground">
              The app ran into a problem. Please refresh and try again.
            </p>
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-foreground px-4 text-sm font-medium text-background"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
