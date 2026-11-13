"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
  ChevronDown,
  Command,
  ExternalLink,
  LogOut,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  User,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useSidebarCollapsed, useSidebarCollapsedSetter } from "@/hooks/use-sidebar-collapsed"
import { useUserProfile } from "@/hooks/use-user-profile"
import {
  MOBILE_BAR_ITEMS,
  NAV_CATEGORIES,
  NAV_ITEMS,
  SETTINGS_NAV_ITEM,
  type NavItem,
} from "@/lib/navigation"
import { UserAvatar } from "@/components/workspace/user-avatar"
import { ThemeIconButton } from "@/components/theme-toggle"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

function isActivePath(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
}

function DesktopNav({ pathname, collapsed }: { pathname: string; collapsed: boolean }) {
  return (
    <nav className="flex flex-col gap-5" aria-label="Workspace navigation">
      {NAV_CATEGORIES.map((category, categoryIndex) => (
        <div key={category.id}>
          {!collapsed ? (
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {category.label}
            </p>
          ) : categoryIndex > 0 ? (
            <div className="mx-auto mb-2 h-px w-7 bg-border" aria-hidden="true" />
          ) : null}
          <ul className="flex flex-col gap-0.5">
            {category.items.map((item) => {
              const Icon = item.icon
              const active = isActivePath(pathname, item.href, item.exact)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-9 items-center rounded-lg text-sm transition-colors duration-150",
                      collapsed ? "mx-2 justify-center px-0" : "gap-2.5 px-3",
                      active
                        ? "bg-foreground font-medium text-background"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {!collapsed ? (
                      <span className="truncate">{item.label}</span>
                    ) : (
                      <span className="sr-only">{item.label}</span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

function AccountMenu({ collapsed }: { collapsed: boolean }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { name, email, avatarUrl, initials } = useUserProfile()

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setOpen(false)
    router.push("/login")
    router.refresh()
  }

  const displayName = name ?? "Signed in"

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg text-sm transition-colors duration-150 hover:bg-accent",
          collapsed ? "mx-2 justify-center px-0 py-2" : "px-2 py-2"
        )}
      >
        <UserAvatar src={avatarUrl} name={displayName} initials={initials} size={28} />
        {!collapsed ? (
          <>
            <span className="min-w-0 flex-1 text-left">
              <span className="block truncate text-xs font-medium text-foreground">{displayName}</span>
              {email ? (
                <span className="block truncate text-[11px] text-muted-foreground">{email}</span>
              ) : null}
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          </>
        ) : (
          <span className="sr-only">Account menu</span>
        )}
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            aria-label="Close account menu"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className={cn(
              "absolute bottom-full z-20 mb-2 w-56 overflow-hidden rounded-xl border border-border bg-popover shadow-lg",
              collapsed ? "left-0" : "left-0 right-0"
            )}
          >
            <div className="flex items-center gap-3 border-b border-border px-3 py-2.5">
              <UserAvatar src={avatarUrl} name={displayName} initials={initials} size={36} />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{displayName}</p>
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{email ?? "Not available"}</p>
              </div>
            </div>
            <div className="p-1">
              <Link
                href="/app/profile"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex min-h-9 items-center gap-2.5 rounded-md px-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <User className="h-3.5 w-3.5" aria-hidden="true" />
                Profile
              </Link>
              <Link
                href="/app/settings"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex min-h-9 items-center gap-2.5 rounded-md px-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Settings className="h-3.5 w-3.5" aria-hidden="true" />
                Settings
              </Link>
              <Link
                href="/"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex min-h-9 items-center gap-2.5 rounded-md px-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                Marketing site
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={signOut}
                className="flex min-h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Sign out
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

/**
 * The small-screen replacement for the sidebar. Every workspace page stays
 * reachable: four slots in the bar itself, everything else inside the sheet.
 */
function MobileMoreSheet({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { name, email, avatarUrl, initials } = useUserProfile()

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setOpen(false)
    router.push("/login")
    router.refresh()
  }

  const displayName = name ?? "Signed in"

  // The bar holds Home, Snippets and Chat. Everything else lives in the
  // sheet, so the More slot is marked active while one of those is open.
  const barHrefs = MOBILE_BAR_ITEMS.map((item) => item.href)
  const moreActive = !barHrefs.some((href) => isActivePath(pathname, href))

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-current={moreActive ? "page" : undefined}
          className={cn(
            "flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-1 py-1.5 text-[11px] font-medium transition-colors duration-150",
            moreActive
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <MoreHorizontal className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="max-w-full truncate">More</span>
        </button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[85dvh] gap-0 overflow-y-auto px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4"
      >
        <SheetHeader className="p-0 pr-8">
          <SheetTitle className="text-sm">All tools</SheetTitle>
        </SheetHeader>

        <div className="mt-3">
          {NAV_CATEGORIES.map((category) => (
            <div key={category.id} className="mb-4 last:mb-0">
              <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {category.label}
              </p>
              <ul className="flex flex-col gap-0.5">
                {category.items.map((item) => {
                  const Icon = item.icon
                  const active = isActivePath(pathname, item.href, item.exact)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex min-h-11 items-center gap-2.5 rounded-lg px-2 text-sm transition-colors duration-150",
                          active
                            ? "bg-foreground font-medium text-background"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-3">
          <Link
            href={SETTINGS_NAV_ITEM.href}
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center gap-2.5 rounded-lg px-2 text-sm text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
          >
            <Settings className="h-4 w-4 shrink-0" aria-hidden="true" />
            Settings
          </Link>
          <Link
            href="/app/profile"
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center gap-2.5 rounded-lg px-2 text-sm text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
          >
            <User className="h-4 w-4 shrink-0" aria-hidden="true" />
            Profile
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="flex min-h-11 w-full items-center gap-2.5 rounded-lg px-2 text-sm text-muted-foreground transition-colors duration-150 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            Sign out
          </button>
        </div>

        <div className="mt-3 flex items-center gap-3 border-t border-border pt-3">
          <UserAvatar src={avatarUrl} name={displayName} initials={initials} size={36} />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">{displayName}</p>
            {email ? <p className="truncate text-[11px] text-muted-foreground">{email}</p> : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const collapsed = useSidebarCollapsed()
  const setCollapsed = useSidebarCollapsedSetter()
  const { name, avatarUrl, initials } = useUserProfile()

  const toggleCollapsed = () => {
    setCollapsed(!collapsed)
  }

  const currentLabel =
    NAV_ITEMS.find((i) => isActivePath(pathname, i.href, i.exact))?.label ??
    (isActivePath(pathname, SETTINGS_NAV_ITEM.href) ? SETTINGS_NAV_ITEM.label : null) ??
    (isActivePath(pathname, "/app/profile") ? "Profile" : null) ??
    "Workspace"
  const settingsActive = isActivePath(pathname, SETTINGS_NAV_ITEM.href)

  return (
    <div className="min-h-dvh bg-background text-foreground md:h-dvh md:overflow-hidden">
      <div className="flex min-h-dvh md:h-full">
        <aside
          className={cn(
            "hidden h-full shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-200 ease-out md:sticky md:top-0 md:flex",
            collapsed ? "w-[60px]" : "w-60"
          )}
        >
          <div
            className={cn(
              "flex h-14 shrink-0 items-center border-b border-border",
              collapsed ? "justify-center px-2" : "gap-2.5 px-4"
            )}
          >
            <Link
              href="/app/dashboard"
              className={cn(
                "flex items-center font-semibold tracking-tight transition-opacity duration-150 hover:opacity-80",
                collapsed ? "justify-center" : "gap-2.5"
              )}
              title="Minimalist Toolkit"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
                <Command className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              {!collapsed ? <span className="truncate text-sm">Minimalist Toolkit</span> : null}
            </Link>
          </div>

          <div
            className={cn(
              "min-h-0 flex-1 overflow-y-auto overflow-x-hidden",
              collapsed ? "px-0 py-3" : "px-3 py-4"
            )}
          >
            <DesktopNav pathname={pathname} collapsed={collapsed} />
          </div>

          <div
            className={cn(
              "shrink-0 space-y-1 border-t border-border bg-sidebar",
              collapsed ? "px-0 py-2" : "px-2 py-2.5"
            )}
          >
            <AccountMenu collapsed={collapsed} />
            <Link
              href={SETTINGS_NAV_ITEM.href}
              title={collapsed ? "Settings" : undefined}
              aria-current={settingsActive ? "page" : undefined}
              className={cn(
                "flex min-h-9 items-center rounded-lg text-sm transition-colors duration-150",
                collapsed ? "mx-2 justify-center px-0" : "gap-2.5 px-3",
                settingsActive
                  ? "bg-foreground font-medium text-background"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Settings className="h-4 w-4 shrink-0" aria-hidden="true" />
              {!collapsed ? <span>Settings</span> : <span className="sr-only">Settings</span>}
            </Link>
            <button
              type="button"
              onClick={toggleCollapsed}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className={cn(
                "flex min-h-9 w-full items-center rounded-lg text-sm text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground",
                collapsed ? "mx-2 justify-center px-0" : "gap-2.5 px-3"
              )}
            >
              {collapsed ? (
                <PanelLeftOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
              ) : (
                <PanelLeftClose className="h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              {!collapsed ? <span>Collapse</span> : <span className="sr-only">Collapse sidebar</span>}
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col md:min-h-0">
          <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/90 px-3 backdrop-blur sm:px-5">
            <div className="flex min-w-0 items-center gap-2">
              <Link href="/app/dashboard" className="flex items-center gap-2 md:hidden">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background">
                  <Command className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span className="sr-only">Minimalist Toolkit</span>
              </Link>
              <p className="truncate text-sm font-medium">{currentLabel}</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="hidden text-xs text-muted-foreground sm:inline">Private workspace</span>
              <ThemeIconButton className="ml-1" />
              <Link
                href="/app/profile"
                className="flex items-center gap-2 rounded-full"
                aria-label={name ? `Your profile, ${name}` : "Your profile"}
              >
                <UserAvatar src={avatarUrl} name={name ?? "Signed in"} initials={initials} size={28} />
              </Link>
            </div>
          </header>

          <main className="min-w-0 flex-1 bg-background pb-[calc(4rem+env(safe-area-inset-bottom))] text-foreground md:overflow-y-auto md:pb-6">
            {children}
          </main>
        </div>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        aria-label="Mobile navigation"
      >
        <div className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2 py-1.5">
          {MOBILE_BAR_ITEMS.map((item: NavItem) => {
            const Icon = item.icon
            const active = isActivePath(pathname, item.href, item.exact)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-1 py-1.5 text-[11px] font-medium transition-colors duration-150",
                  active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            )
          })}
          <MobileMoreSheet pathname={pathname} />
        </div>
      </nav>
    </div>
  )
}
