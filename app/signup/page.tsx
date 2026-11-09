import { Suspense } from "react"
import LoginPage from "@/app/login/_login"

export const dynamic = "force-dynamic"

export default function SignupPage() {
  return (
    <Suspense>
      <LoginPage mode="signup" />
    </Suspense>
  )
}
