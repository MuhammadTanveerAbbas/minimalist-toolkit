import Link from "next/link"
import { Home, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-12 sm:px-6">
      <div className="w-full max-w-xl text-center">
        <h1 className="text-xl font-medium tracking-tight sm:text-2xl">
          This page is not in the workspace
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          The address may have changed, or the link may be wrong. Use one of the actions below to get back
          to familiar ground.
        </p>

        <p className="mt-6 select-none font-display text-[clamp(3.5rem,14vw,6rem)] leading-none tracking-tight">
          404
        </p>

        <div className="mt-8 flex flex-row gap-2">
          <Button asChild className="h-12 min-w-0 flex-1 whitespace-nowrap px-2 text-xs sm:text-sm">
            <Link href="/">
              <Home className="h-4 w-4 shrink-0" aria-hidden="true" />
              Go home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 min-w-0 flex-1 whitespace-nowrap px-2 text-xs sm:text-sm"
          >
            <Link href="/app/dashboard">
              <LayoutGrid className="h-4 w-4 shrink-0" aria-hidden="true" />
              Open workspace
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
