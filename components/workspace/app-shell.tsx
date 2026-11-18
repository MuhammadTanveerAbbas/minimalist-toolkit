"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useLayoutEffect, useState } from "react"
import { ChevronDown, LogOut, Settings, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useUserProfile } from "@/hooks/use-user-profile"
import { PRIMARY_NAV_ITEMS } from "@/lib/navigation"
import { UserAvatar } from "@/components/workspace/user-avatar"
import { ThemeIconButton } from "@/components/theme-toggle"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

function isActivePath(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
}

function navIndex(pathname: string) {
  return PRIMARY_NAV_ITEMS.findIndex((item) => isActivePath(pathname, item.href, item.exact))
}

/** Layout effect on the client, effect on the server, so SSR stays quiet. */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect

/** The avatar on the right of the top bar. Settings and sign out live here. */
function AccountMenu() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { name, email, avatarUrl, initials } = useUserProfile()

  const displayName = name ?? "Signed in"

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setOpen(false)
    router.push("/login")
    router.refresh()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Account menu for ${displayName}`}
          className="flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-card py-1 pl-1 pr-2 transition-colors hover:bg-accent"
        >
          <UserAvatar src={avatarUrl} name={displayName} initials={initials} size={30} />
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" aria-label="Account menu" className="w-60 p-1.5">
        <div className="flex items-center gap-2.5 border-b border-border px-2.5 py-2">
          <UserAvatar src={avatarUrl} name={displayName} initials={initials} size={34} />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">{displayName}</p>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{email ?? "Not available"}</p>
          </div>
        </div>
        <div className="pt-1">
          <Link
            href="/app/profile"
            onClick={() => setOpen(false)}
            className="flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <User className="h-4 w-4 shrink-0" aria-hidden="true" />
            Profile
          </Link>
          <Link
            href="/app/settings"
            onClick={() => setOpen(false)}
            className="flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Settings className="h-4 w-4 shrink-0" aria-hidden="true" />
            Settings
          </Link>
        </div>
        <div className="mt-1 border-t border-border pt-1">
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** Five equal pills on one row. On small screens the labels sit under the icons. */
function PillNav({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Workspace pages" className="border-b border-border">
      <ul className="mx-auto flex w-full max-w-2xl items-stretch gap-1 px-3 py-2.5 sm:px-6 sm:py-3.5">
        {PRIMARY_NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActivePath(pathname, item.href, item.exact)
          return (
            <li key={item.href} className="min-w-0 flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-11 w-full flex-col items-center justify-center gap-0.5 rounded-full px-1 text-[10px] font-medium leading-none transition-colors duration-150 sm:h-9 sm:flex-row sm:gap-2 sm:px-2 sm:text-xs md:px-3",
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="w-full truncate text-center">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/**
 * Slides the incoming page in from the right when someone moves forward
 * through the pill bar, and from the left when they move back.
 */
function PageTransition({ pathname, children }: { pathname: string; children: React.ReactNode }) {
  const index = navIndex(pathname)
  const [state, setState] = useState<{
    index: number
    direction: "right" | "left" | null
  }>({ index, direction: null })

  // Derive the direction during render, so the first paint already has it.
  const direction =
    state.index === index
      ? state.direction
      : state.index === -1 || index === -1
        ? null
        : index > state.index
          ? "right"
          : "left"

  useIsomorphicLayoutEffect(() => {
    setState((previous) => {
      if (previous.index === index) return previous
      const nextDirection =
        previous.index === -1 || index === -1
          ? null
          : index > previous.index
            ? "right"
            : "left"
      return { index, direction: nextDirection }
    })
  }, [index])

  const animation =
    direction === "right"
      ? "page-enter-right"
      : direction === "left"
        ? "page-enter-left"
        : ""

  return (
    <div key={pathname} className={cn("h-full overflow-x-clip", animation)}>
      {children}
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-dvh bg-background text-foreground md:flex md:h-dvh md:flex-col">
      <div className="flex min-h-dvh flex-col md:h-full md:min-h-0">
        <header className="sticky top-0 z-30 border-b border-border bg-background">
          <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-3 px-3 sm:px-6 lg:px-8">

            {/* Logo */}
            <Link
              href="/app/dashboard"
              className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-foreground">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" stroke="#FDFBF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="hidden text-sm font-semibold tracking-tight sm:block">Minimalist Toolkit</span>
            </Link>

            {/* Pill nav — centered */}
            <nav aria-label="Workspace pages" className="flex flex-1 justify-center">
              <ul className="flex items-center gap-0.5 rounded-full border border-border bg-card p-1">
                {PRIMARY_NAV_ITEMS.map((item) => {
                  const Icon = item.icon
                  const active = isActivePath(pathname, item.href, item.exact)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex h-8 items-center gap-1.5 rounded-full px-4 text-xs font-medium transition-colors duration-150",
                          active
                            ? "bg-foreground text-background"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                      >
                        <Icon
                          className="h-3.5 w-3.5 shrink-0"
                          style={{ color: active ? undefined : item.accent }}
                          aria-hidden="true"
                        />
                        <span className="hidden sm:inline">{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            {/* Right actions */}
            <div className="flex shrink-0 items-center gap-2">
              <ThemeIconButton className="h-9 w-9" />
              <AccountMenu />
            </div>

          </div>
        </header>

        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-background text-foreground">
          <PageTransition pathname={pathname}>{children}</PageTransition>
        </main>
      </div>
    </div>
  )
}
