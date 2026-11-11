import { Suspense } from "react"
import type { Metadata } from "next"
import AuthPage from "@/app/login/_login"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a Minimalist Toolkit account and unlock all six tools.",
  robots: { index: false, follow: false },
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <AuthPage mode="signup" />
    </Suspense>
  )
}
