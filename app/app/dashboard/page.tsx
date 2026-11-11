import type { Metadata } from "next"
import { Dashboard } from "@/components/workspace/dashboard"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your Minimalist Toolkit workspace at a glance.",
}

export default function DashboardPage() {
  return <Dashboard />
}
