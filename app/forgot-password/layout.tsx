import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Recover account",
  description: "Recover access to your Minimalist Toolkit account.",
  robots: { index: false, follow: false },
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children
}
