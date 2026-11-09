import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-8 sm:py-12">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 sm:p-6">
        <h1 className="text-xl font-semibold tracking-tight">Account help</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          If you sign in with Google, use your Google account recovery options, then return here and sign in again.
        </p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          If you still cannot access your account, contact the workspace owner or support channel for this app.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity duration-150 hover:opacity-90"
          >
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium transition-colors duration-150 hover:bg-muted/40"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
