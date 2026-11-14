"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Command, Eye, EyeOff, Loader2, KeyRound } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

/**
 * Completes email password recovery after /auth/callback exchanges the code.
 * The user already holds a recovery session; this form calls updateUser.
 */
export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true
    createClient()
      .auth.getUser()
      .then(({ data, error: authErr }: { data: { user?: unknown }; error: Error | null }) => {
        if (!active) return
        if (authErr || !data.user) {
          router.replace("/login?error=" + encodeURIComponent("Open the reset link from your email to continue."))
          return
        }
        setReady(true)
      })
    return () => {
      active = false
    }
  }, [router])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    setError(null)
    setNotice(null)

    if (password.length < 8) {
      setError("Use at least 8 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error: updateErr } = await supabase.auth.updateUser({ password })
      if (updateErr) {
        setError(updateErr.message || "Unable to update password.")
        setIsLoading(false)
        return
      }
      setNotice("Password updated. Redirecting to your workspace…")
      window.setTimeout(() => {
        router.replace("/app/dashboard")
        router.refresh()
      }, 800)
    } catch {
      setError("Unable to update password.")
      setIsLoading(false)
    }
  }

  if (!ready) {
    return <div className="min-h-dvh" aria-busy="true" />
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
          <h1 className="mt-4 text-xl font-semibold tracking-tight">Set a new password</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Choose a new password for your account. You will stay signed in after saving.
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

          <form className="mt-5 space-y-3" onSubmit={onSubmit}>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                New password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="confirm" className="text-xs font-medium text-muted-foreground">
                Confirm password
              </label>
              <input
                id="confirm"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="min-h-11 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
                placeholder="Repeat password"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Save password
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
