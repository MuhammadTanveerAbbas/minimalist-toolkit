import Link from "next/link"
import { Command } from "lucide-react"
import { TOOLS } from "@/lib/navigation"

const PRODUCT_LINKS = [
  { href: "#workflow", label: "How it works" },
  { href: "#use-cases", label: "Use cases" },
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
    <footer
      className="relative border-t border-border bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/Footer.gif')" }}
    >
      {/* Scrim just enough to keep text readable, GIF stays visible */}
      <div
        className="absolute inset-0 bg-background/55 backdrop-blur-[1px] dark:bg-background/65"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 pt-16 pb-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">

          {/* Brand full width on mobile, single col on lg */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label="Minimalist Toolkit home">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
                <Command className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold tracking-tight">Minimalist Toolkit</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
              Six focused tools for code, visuals, prompts, and AI. One account, one workspace.
            </p>
          </div>

          {/* Tools */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tools</h2>
            <ul className="mt-4 space-y-2.5">
              {TOOLS.map((tool) => (
                <li key={tool.id}>
                  <Link
                    href={tool.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Product */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</h2>
            <ul className="mt-4 space-y-2.5">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account</h2>
            <ul className="mt-4 space-y-2.5">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col gap-2 border-t border-border/40 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Minimalist Toolkit a workspace for focused work.
          </p>
          <p className="text-xs text-muted-foreground">
            Built by{" "}
            <a
              href="https://muhammadtanveerabbas.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Tanveer
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
