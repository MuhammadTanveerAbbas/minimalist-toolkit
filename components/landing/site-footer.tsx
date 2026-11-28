"use client"

import Link from "next/link"
import { ArrowUpRight, Github, Globe } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { TOOLS } from "@/lib/navigation"

const GROUPS: { title: string; links: { href: string; label: string; external?: boolean }[] }[] = [
  {
    title: "Tools",
    links: TOOLS.map((tool) => ({ href: tool.href, label: tool.name })),
  },
  {
    title: "Product",
    links: [
      { href: "#workflow", label: "How it works" },
      { href: "#providers", label: "Providers" },
      { href: "#security", label: "Security" },
      { href: "#faq", label: "Questions" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Log in" },
      { href: "/signup", label: "Create an account" },
      { href: "/forgot-password", label: "Reset password" },
      { href: "/app/dashboard", label: "Open workspace" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)] lg:gap-20">
          {/* Brand statement */}
          <div className="flex flex-col items-start">
            <Link href="/" className="inline-flex items-center gap-2" aria-label="Minimalist Toolkit home">
              <BrandLogo size={40} />
              <span className="font-display text-xl tracking-tight">Minimalist Toolkit</span>
            </Link>
            <p className="mt-5 max-w-sm text-pretty text-sm leading-6 text-muted-foreground">
              One account for code snippets, prompts, model comparisons, AI chat and a daily open-source
              news feed. Your work stays yours.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://muhammadtanveerabbas.vercel.app"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-accent"
              >
                <Globe className="h-4 w-4" aria-hidden="true" />
                My Site
              </a>
              <a
                href="https://github.com/MuhammadTanveerAbbas/minimalist-toolkit"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-accent"
              >
                <Github className="h-4 w-4" aria-hidden="true" />
                Source code
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {GROUPS.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h2 className="font-mono text-[11px] text-muted-foreground">{group.title}</h2>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                        {link.external ? <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Oversized wordmark as the signature detail */}
        <div
          className="mt-10 overflow-hidden pt-6 pb-3 sm:mt-16 sm:pt-8 sm:pb-10"
          style={{ containerType: "inline-size" }}
        >
          <p className="font-display font-normal leading-[1] tracking-[0.01em] text-center text-foreground/20 text-[length:21.8cqw] select-none whitespace-nowrap sm:text-left sm:text-foreground/10 sm:text-[length:13.2cqw]">
            <span className="block sm:inline">MINIMALIST</span>{" "}
            <span className="block sm:inline">TOOLKIT</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
