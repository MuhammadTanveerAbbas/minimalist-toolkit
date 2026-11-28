"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { TOOLS } from "@/lib/navigation"

export function FinalCta() {
  return (
    <section className="border-b border-border bg-surface-2">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-14 text-center sm:px-12 sm:py-20">
          {/* Grid lines decoration */}
          <div
            className="pointer-events-none absolute inset-0 grid-lines opacity-[0.15] [mask-image:radial-gradient(75%_75%_at_50%_0%,black,transparent_80%)]"
            aria-hidden="true"
          />
          <div className="relative">
            <BrandLogo size={44} />

            <h2 className="mx-auto mt-6 max-w-2xl text-balance-tight text-3xl font-semibold tracking-tight sm:text-4xl">
              One account. Every tool in one workspace.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-7 text-muted-foreground">
              Start with the tool you need today and add the rest when you need them. Nothing expires, and
              nothing is taken away.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-90 sm:w-auto"
              >
                Create your workspace
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/login"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-border bg-background px-6 text-sm font-medium transition-colors hover:bg-accent sm:w-auto"
              >
                I already have an account
              </Link>
            </div>

            {/* Tool chips */}
            <ul className="mt-10 flex flex-wrap items-center justify-center gap-2">
              {TOOLS.map((tool) => (
                <li
                  key={tool.id}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs text-muted-foreground"
                >
                  <tool.icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" style={{ color: tool.accent }} />
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
