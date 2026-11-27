import Link from "next/link"
import { ArrowUp, ArrowUpRight } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import { ThemeIconButton } from "@/components/theme-toggle"
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
            <Link href="/" className="inline-flex items-center gap-3" aria-label="Minimalist Toolkit home">
              <BrandLogo size={40} />
              <span className="font-display text-xl tracking-tight">Minimalist Toolkit</span>
            </Link>
            <p className="mt-5 max-w-sm text-pretty text-sm leading-6 text-muted-foreground">
              One account for code snippets, prompts, model comparisons, AI chat and a daily open-source
              news feed. Your work stays yours.
            </p>
            <a
              href="https://github.com/MuhammadTanveerAbbas/minimalist-toolkit"
              target="_blank"
              rel="noreferrer noopener"
              className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-accent"
            >
              View the source
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
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
        <div className="mt-16 overflow-hidden border-t border-border pt-8">
          <p
            className="font-display font-normal leading-[0.88] tracking-[-0.04em] text-foreground/10 select-none whitespace-nowrap"
            style={{ fontSize: "clamp(2rem, 12vw, 10.5rem)", letterSpacing: "-0.02em", wordSpacing: "0.15em" }}
          >
            Minimalist Toolkit
          </p>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center gap-4 border-t border-border py-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-xs text-muted-foreground">
            Built by{" "}
            <a
              href="https://muhammadtanveerabbas.vercel.app"
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Tanveer
            </a>
            . No tracking, no per-seat pricing.
          </p>
          <div className="hidden items-center gap-2 sm:flex">
            <ThemeIconButton className="h-9 w-9 rounded-lg border border-border bg-card" />
            <a
              href="#top"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-medium transition-colors hover:bg-accent"
            >
              Back to top
              <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
