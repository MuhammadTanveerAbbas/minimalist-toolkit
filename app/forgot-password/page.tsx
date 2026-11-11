import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Command, KeyRound, Mail, ShieldCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "Account help",
  description: "Recover access to your Minimalist Toolkit account.",
  robots: { index: false, follow: false },
}

export default function ForgotPasswordPage() {
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
          <h1 className="mt-4 text-xl font-semibold tracking-tight">Account help</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Accounts here use Google sign-in, so password recovery runs through Google rather than a reset
            email from this app.
          </p>

          <ol className="mt-5 space-y-3">
            {[
              {
                icon: Mail,
                title: "Reset your Google password",
                body: "Use google.com/account recovery to reset the password on the Google account you sign in with.",
              },
              {
                icon: ShieldCheck,
                title: "Sign in again",
                body: "Return here and choose Continue with Google. Any existing workspace data is untouched.",
              },
            ].map((step, index) => (
              <li key={step.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 font-mono text-[11px] tabular-nums text-muted-foreground">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="mt-0.5 text-sm leading-6 text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-5 rounded-lg border border-border bg-surface-2 p-3 text-sm leading-6 text-muted-foreground">
            If the Google account is no longer yours, or you use a workspace email that was deactivated,
            contact the workspace owner. Access is bound to the Google account id, so there is no separate
            password to reset.
          </p>

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
