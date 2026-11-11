import { redirect } from "next/navigation"

/**
 * The workspace dashboard lives at /app/dashboard. /app is kept as a
 * permanent redirect so existing bookmarks and links keep working.
 */
export default function AppIndexPage() {
  redirect("/app/dashboard")
}
