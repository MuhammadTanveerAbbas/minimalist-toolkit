import Link from "next/link"
import { Command } from "lucide-react"
import { TOOLS } from "@/lib/navigation"

const PRODUCT_LINKS = [
  { href: "#workflow", label: "How it works" },
  { href: "#use-cases", label: "Use cases" },
  { href: "#security", label: "Security" },
  { href: "#faq", label: "FAQ" },
]

const ACCOUNT_LINKS = [
  { href: "/login", label: "Log in" },
  { href: "/signup", label: "Create an account" },
  { href: "/forgot-password", label: "Account help" },
  { href: "/app/dashboard", label: "Open workspace" },
]

export function SiteFooter() {
  return (
    <footer className="bg-surface-2">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
                <Command className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold tracking-tight">Minimalist Toolkit</span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Six focused tools for code, visuals, prompts, client work and roadmap decisions. One account,
              one workspace, no lock-in.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tools</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {TOOLS.map((tool) => (
                <li key={tool.id}>
                  <Link
                    href={tool.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Minimalist Toolkit. A workspace for focused work.</p>
          <p>
            Built by{" "}
            <a
              href="https://muhammadtanveerabbas.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
            >
              Tanveer
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
