import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card">
          <FileQuestion className="h-6 w-6 text-muted-foreground" />
        </div>
        <h1 className="text-lg font-semibold tracking-tight">Page not found</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium transition-colors duration-150 hover:bg-muted/40">
          Go home
        </Link>
      </div>
    </div>
  )
}
