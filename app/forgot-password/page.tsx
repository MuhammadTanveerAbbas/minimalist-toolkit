"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Command, KeyRound, Loader2, Mail, ShieldCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const sendReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    setError(null)
    setNotice(null)

    const trimmed = email.trim()
    if (!trimmed) {
      setError("Enter the email you use to sign in.")
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const redirect = new URL("/auth/callback", window.location.origin)
      redirect.searchParams.set("next", "/update-password")
      redirect.searchParams.set("type", "recovery")
      const { error: authErr } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: redirect.toString(),
      })
      if (authErr) {
        setError(authErr.message || "Unable to send reset email.")
      } else {
        // Same message whether or not the address exists, to avoid account enumeration.
        setNotice("If an account exists for that email, a reset link is on its way. Check your inbox.")
      }
    } catch {
      setError("Unable to send reset email.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-background px-4 py-10 sm:py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 inline-flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
            <Command className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold tracking-tight">Minimalist Toolkit</span>
        </Link>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-2">
            <KeyRound className="h-4 w-4 text-brand" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-xl font-semibold tracking-tight">Recover your account</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Enter your email and we will send a link to set a new password.
          </p>

          {error ? (
            <p role="alert" className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {notice ? (
            <p role="status" className="mt-4 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-foreground">
              {notice}
            </p>
          ) : null}

          <form className="mt-5 space-y-3" onSubmit={sendReset}>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Mail className="h-4 w-4" aria-hidden="true" />}
              Send reset link
            </button>
          </form>

          <ol className="mt-6 space-y-3 border-t border-border pt-5">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 font-mono text-[11px] text-muted-foreground">
                1
              </span>
              <div>
                <p className="text-sm font-medium">Email and password</p>
                <p className="mt-0.5 text-sm leading-6 text-muted-foreground">
                  Use the form above. Open the link from your inbox to choose a new password.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 font-mono text-[11px] text-muted-foreground">
                2
              </span>
              <div>
                <p className="text-sm font-medium flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                  Google account
                </p>
                <p className="mt-0.5 text-sm leading-6 text-muted-foreground">
                  Recover access at Google Account Recovery, then sign in here with Continue with Google.
                  Your workspace data stays tied to that Google identity.
                </p>
              </div>
            </li>
          </ol>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to login
            </Link>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-accent"
            >
              Back to the site
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
