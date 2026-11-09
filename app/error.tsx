'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

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
      <div className="w-full max-w-sm space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <h1 className="text-lg font-semibold tracking-tight">Something went wrong</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>
        <Button onClick={reset} variant="secondary" className="min-h-11 px-4">
          Try again
        </Button>
      </div>
    </div>
  )
}
