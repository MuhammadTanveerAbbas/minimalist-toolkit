import Link from "next/link"
import { ArrowRight, Command } from "lucide-react"
import { TOOLS } from "@/lib/navigation"

export function FinalCta() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-12 text-center sm:px-12 sm:py-16">
          <div
            className="pointer-events-none absolute inset-0 grid-lines opacity-20 [mask-image:radial-gradient(80%_80%_at_50%_0%,black,transparent_75%)]"
            aria-hidden="true"
          />
          <div className="relative">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
              <Command className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mx-auto mt-6 max-w-2xl text-balance-tight text-3xl font-semibold tracking-tight sm:text-4xl">
              One account. Six focused tools. No per-seat pricing to understand.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-7 text-muted-foreground">
              Start with the tool you need today and add the rest when you need them. Nothing expires, and
              nothing is taken away.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Create your workspace
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-background px-5 text-sm font-medium transition-colors hover:bg-accent"
              >
                I already have an account
              </Link>
            </div>

            <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              {TOOLS.slice(0, 5).map((tool) => (
                <li key={tool.id} className="flex items-center gap-1.5">
                  <tool.icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {tool.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
