import { cookies } from "next/headers"
import { AppShell } from "@/components/workspace/app-shell"

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return <AppShell defaultOpen={defaultOpen}>{children}</AppShell>
}
