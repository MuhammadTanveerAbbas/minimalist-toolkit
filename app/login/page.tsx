import { Suspense } from "react"
import type { Metadata } from "next"
import AuthPage from "./_login"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to your Minimalist Toolkit workspace.",
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <AuthPage mode="login" />
    </Suspense>
  )
}

function AuthFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-foreground" role="status" aria-label="Loading" />
    </div>
  )
}
