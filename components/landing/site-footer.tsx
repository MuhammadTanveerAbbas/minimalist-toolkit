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
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm border-b border-border pb-6 sm:border-b-0 sm:pb-0">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
                <Command className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold tracking-tight">Minimalist Toolkit</span>
            </Link>
            <p className="mt-3 max-w-prose text-sm leading-6 text-muted-foreground">
              Six focused tools for code, visuals, prompts, client work and roadmap decisions. One account,
              one workspace.
            </p>
          </div>

          <div className="border-b border-border py-4 sm:border-b-0 sm:py-0">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tools</h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm sm:block sm:space-y-2">
              {TOOLS.map((tool) => (
                <li key={tool.id}>
                  <Link
                    href={tool.href}
                    className="inline-flex min-h-10 w-full items-center text-muted-foreground transition-colors hover:text-foreground sm:min-h-0 sm:w-auto"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-b border-border py-4 sm:border-b-0 sm:py-0">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm sm:block sm:space-y-2">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="inline-flex min-h-10 w-full items-center text-muted-foreground transition-colors hover:text-foreground sm:min-h-0 sm:w-auto"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="py-4 sm:py-0">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account</h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm sm:block sm:space-y-2">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-10 w-full items-center text-muted-foreground transition-colors hover:text-foreground sm:min-h-0 sm:w-auto"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4 text-center text-xs text-muted-foreground sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:text-left">
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
