"use client"

import { useCallback, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  Command,
  FileText,
  Loader2,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface AuthPageProps {
  mode: "login" | "signup"
}

/**
 * Shared sign-in / sign-up surface.
 *
 * The "next" destination is read from the query string, validated against a
 * strict allow-list of internal paths, and forwarded to the OAuth callback
 * so the user lands where they were originally headed.
 */
export default function AuthPage({ mode }: AuthPageProps) {
  const searchParams = useSearchParams()
  const authError = searchParams.get("error")
  const rawNext = searchParams.get("next")

  const [localError, setLocalError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const next = useCallback(() => {
    if (!rawNext) return null
    if (!rawNext.startsWith("/")) return null
    if (rawNext.startsWith("//") || rawNext.startsWith("/\\")) return null
    if (rawNext.includes("\\")) return null
    try {
      const parsed = new URL(rawNext, "https://internal.invalid")
      if (parsed.origin !== "https://internal.invalid") return null
      return `${parsed.pathname}${parsed.search}${parsed.hash}`
    } catch {
      return null
    }
  }, [rawNext])

  const signInWithGoogle = async () => {
    if (isLoading) return
    setLocalError(null)
    setIsLoading(true)
    try {
      const redirect = new URL("/auth/callback", window.location.origin)
      const destination = next()
      if (destination) redirect.searchParams.set("next", destination)
      const { error: authErr } = await createClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirect.toString() },
      })
      if (authErr) {
        setLocalError(authErr.message || "Unable to sign in. Please try again.")
        setIsLoading(false)
      }
    } catch {
      setLocalError("Unable to start the sign-in flow. Please try again.")
      setIsLoading(false)
    }
  }

  const displayError = localError || authError
  const isSignup = mode === "signup"

  return (
    <div className="relative grid min-h-dvh lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col px-4 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          <Link href="/" className="mb-8 inline-flex w-fit items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
              <Command className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold tracking-tight">Minimalist Toolkit</span>
          </Link>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <div className="space-y-2">
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {isSignup ? "Create your workspace" : "Welcome back"}
              </h1>
              <p className="text-sm leading-6 text-muted-foreground">
                {isSignup
                  ? "One Google account unlocks all six tools. No card, no trial countdown."
                  : "Sign in to pick up where you left off."}
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {displayError ? (
                <p
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                >
                  {displayError}
                </p>
              ) : null}

              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={isLoading}
                className="flex min-h-11 w-full items-center justify-center gap-3 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-60"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                    <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05" />
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                  </svg>
                )}
                {isLoading ? "Continuing..." : "Continue with Google"}
              </button>

              <div className="space-y-2 text-center text-sm text-muted-foreground">
                <p>
                  {isSignup ? (
                    <>
                      Already have an account?{" "}
                      <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
                        Log in
                      </Link>
                    </>
                  ) : (
                    <>
                      New here?{" "}
                      <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
                        Create an account
                      </Link>
                    </>
                  )}
                </p>
                <p>
                  <Link href="/forgot-password" className="underline-offset-4 hover:text-foreground hover:underline">
                    Need help signing in?
                  </Link>
                </p>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/" className="underline-offset-4 hover:text-foreground hover:underline">
              Back to the site
            </Link>
          </p>
        </div>
      </div>

      {/* Context side */}
      <div className="relative hidden overflow-hidden border-l border-border bg-surface-2 lg:flex lg:flex-col lg:justify-center">
        <div
          className="pointer-events-none absolute inset-0 grid-lines opacity-30 [mask-image:radial-gradient(90%_90%_at_60%_20%,black,transparent_80%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-10 right-4 select-none text-[11rem] font-semibold leading-none tracking-tighter text-surface-3"
          aria-hidden="true"
        >
          06
        </div>
        <div className="relative px-10 py-16 xl:px-14">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">
            Everything in one workspace
          </p>
          <h2 className="mt-4 max-w-md text-balance-tight text-3xl font-semibold tracking-tight">
            Six tools that each do one thing properly
          </h2>

          <ul className="mt-8 space-y-4">
            {[
              { icon: ShieldCheck, label: "Server-side route protection", detail: "Private pages never reach an unsigned browser." },
              { icon: FileText, label: "Quotes and invoices", detail: "Scope the work, price it, convert it." },
              { icon: Target, label: "Prioritizer", detail: "Defend the roadmap order with evidence." },
              { icon: Sparkles, label: "PromptCraft and Mockify", detail: "Sharper prompts and faster visual drafts." },
            ].map((item) => (
              <li key={item.label} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
                  <item.icon className="h-4 w-4 text-brand" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="mt-0.5 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-10 rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-medium">What you get on the free account</p>
            <ul className="mt-3 space-y-2">
              {["All six tools", "Private, owner-only storage", "Export everything you create"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden="true" />
                    {item}
                  </li>
                )
              )}
            </ul>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
            >
              Read more about the toolkit
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
