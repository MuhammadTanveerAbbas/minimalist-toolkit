"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRight, Command } from "lucide-react"
import { ThemeIconButton } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

const LINKS: { href: string; label: string }[] = []

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-colors duration-200",
        scrolled ? "border-border bg-background/85 backdrop-blur-md" : "border-transparent bg-background"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Minimalist Toolkit home">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
            <Command className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold tracking-tight">Minimalist Toolkit</span>
        </Link>

        {LINKS.length > 0 ? (
          <nav aria-label="Primary" className="ml-4 hidden items-center gap-1 md:flex">
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
        ) : null}

        <div className="ml-auto flex items-center gap-2">
          <ThemeIconButton />
          <Link
            href="/login"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Get started
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  )
}
