"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Code2,
  ImageIcon,
  Sparkles,
  Settings,
  LogOut,
  BarChart3,
  FolderOpen,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "@/hooks/use-theme"
import { cn } from "@/lib/utils"

type NavItem = { href: string; label: string; icon: React.ElementType; exact?: boolean }
type NavGroup = { label: string; items: NavItem[] }

const navGroups: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { href: "/app", label: "Dashboard", icon: BarChart3, exact: true },
      { href: "/app/categories", label: "Categories", icon: FolderOpen },
      { href: "/app/chat", label: "AI chat", icon: MessageSquareText },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/app/snippets", label: "Snippets", icon: Code2 },
      { href: "/app/mockify", label: "Mockify", icon: ImageIcon },
      { href: "/app/promptcraft", label: "PromptCraft", icon: Sparkles },
    ],
  },
]

const settingsItem: NavItem = { href: "/app/settings", label: "Settings", icon: Settings }
const allNavItems = [...navGroups.flatMap((g) => g.items), settingsItem]

const mobileNavItems: NavItem[] = [
  { href: "/app", label: "Home", icon: BarChart3, exact: true },
  { href: "/app/snippets", label: "Snippets", icon: Code2 },
  { href: "/app/mockify", label: "Mockify", icon: ImageIcon },
  { href: "/app/chat", label: "Chat", icon: MessageSquareText },
  settingsItem,
]

function isActivePath(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
}

function DesktopNav({ pathname, collapsed }: { pathname: string; collapsed: boolean }) {
  return (
    <nav className="flex flex-col gap-4" aria-label="Workspace navigation">
      {navGroups.map((group, groupIndex) => (
        <div key={group.label}>
          {!collapsed ? (
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/80">
              {group.label}
            </p>
          ) : groupIndex > 0 ? (
            <div className="mx-auto mb-1.5 h-px w-8 bg-border" aria-hidden="true" />
          ) : null}
          <div className="flex flex-col gap-1">
            {group.items.map((item) => {
              const Icon = item.icon
              const active = isActivePath(pathname, item.href, item.exact)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex min-h-10 items-center rounded-lg text-sm transition-colors duration-150",
                    collapsed ? "mx-2 justify-center px-0" : "gap-2.5 px-3",
                    active
                      ? "bg-foreground text-background"
                      : "text-foreground/80 hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed ? <span className="truncate">{item.label}</span> : <span className="sr-only">{item.label}</span>}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [email, setEmail] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("workspace-sidebar-collapsed") === "1"
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate persisted UI preference once on mount
      setCollapsed(saved)
    } catch {}
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }: { data: { user: { email?: string | null } | null } | null }) =>
      setEmail(data?.user?.email ?? null)
    )
  }, [])

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      const next = !v
      try {
        localStorage.setItem("workspace-sidebar-collapsed", next ? "1" : "0")
      } catch {}
      return next
    })
  }

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const currentLabel =
    allNavItems.find((i) => isActivePath(pathname, i.href, i.exact))?.label ?? "Workspace"

  const settingsActive = isActivePath(pathname, settingsItem.href)

  return (
    <div className="min-h-dvh bg-background text-foreground md:h-dvh md:overflow-hidden">
      <div className="flex min-h-dvh md:h-full">
        <aside
          className={cn(
            "hidden h-full shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-200 ease-out md:sticky md:top-0 md:flex",
            collapsed ? "w-[72px]" : "w-64"
          )}
        >
          <div className={cn("flex h-14 items-center border-b border-border", collapsed ? "justify-center px-2" : "gap-2 px-4")}>
            <Link
              href="/app"
              className={cn("flex items-center font-semibold tracking-tight text-foreground transition-opacity duration-150 hover:opacity-80", collapsed ? "justify-center" : "gap-2")}
              title="Minimalist Toolkit"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                <Code2 className="h-4 w-4" />
              </span>
              {!collapsed ? <span className="truncate">Minimalist Toolkit</span> : <span className="sr-only">Minimalist Toolkit</span>}
            </Link>
          </div>

          <div className={cn("min-h-0 flex-1 overflow-y-auto overflow-x-hidden", collapsed ? "p-2" : "p-3")}>
            <DesktopNav pathname={pathname} collapsed={collapsed} />
          </div>

          <div className={cn("shrink-0 border-t border-border bg-sidebar", collapsed ? "p-2" : "p-3")}>
            {!collapsed && email ? (
              <p className="truncate px-2 pb-2 text-xs text-muted-foreground" title={email}>
                {email}
              </p>
            ) : null}

            <button
              type="button"
              onClick={signOut}
              title={collapsed ? "Sign out" : undefined}
              className={cn(
                "flex min-h-10 w-full items-center rounded-lg text-sm text-muted-foreground transition-colors duration-150 hover:bg-muted/60 hover:text-foreground",
                collapsed ? "mx-2 justify-center px-0" : "gap-2.5 px-3"
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed ? <span>Sign out</span> : <span className="sr-only">Sign out</span>}
            </button>

            <Link
              href={settingsItem.href}
              title={collapsed ? "Settings" : undefined}
              className={cn(
                "mt-1 flex min-h-10 w-full items-center rounded-lg text-sm transition-colors duration-150",
                collapsed ? "mx-2 justify-center px-0" : "gap-2.5 px-3",
                settingsActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <Settings className="h-4 w-4 shrink-0" />
              {!collapsed ? <span>Settings</span> : <span className="sr-only">Settings</span>}
            </Link>

            <button
              type="button"
              onClick={toggleCollapsed}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={cn(
                "mt-1 flex min-h-10 w-full items-center rounded-lg text-sm text-muted-foreground transition-colors duration-150 hover:bg-muted/60 hover:text-foreground",
                collapsed ? "mx-2 justify-center px-0" : "gap-2.5 px-3"
              )}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4 shrink-0" /> : <PanelLeftClose className="h-4 w-4 shrink-0" />}
              {!collapsed ? <span>Collapse sidebar</span> : <span className="sr-only">Expand sidebar</span>}
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col md:min-h-0">
          <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-2">
              <Link href="/app" className="flex items-center gap-2 font-semibold tracking-tight md:hidden">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card">
                  <Code2 className="h-4 w-4" />
                </span>
              </Link>
              <p className="truncate text-sm font-medium text-foreground">{currentLabel}</p>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
            </div>
          </header>

          <main className="min-w-0 flex-1 bg-background pb-[calc(4.5rem+env(safe-area-inset-bottom))] text-foreground md:overflow-y-auto md:pb-6">
            {children}
          </main>
        </div>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="Mobile navigation"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1 py-1.5">
          {mobileNavItems.map((item) => {
            const Icon = item.icon
            const active = isActivePath(pathname, item.href, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-1 py-1.5 text-[11px] font-medium transition-colors duration-150",
                  active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
