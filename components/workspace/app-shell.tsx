"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Fragment, useEffect, useLayoutEffect, useState } from "react"
import { ChevronDown, LayoutGrid, LogOut, Settings, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useUserProfile } from "@/hooks/use-user-profile"
import {
  NAV_ORDER,
  SETTINGS_NAV_ITEM,
  SIDEBAR_GROUPS,
  type NavItem,
} from "@/lib/navigation"
import { BrandLogo } from "@/components/brand-logo"
import { UserAvatar } from "@/components/workspace/user-avatar"
import { ThemeIconButton } from "@/components/theme-toggle"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

/** Both the sidebar header and the page bar use this exact height. */
const BAR_HEIGHT = "h-[4.25rem]"

const PROFILE_NAV_ITEM: NavItem = {
  href: "/app/profile",
  label: "Profile",
  icon: User,
}

function isActivePath(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
}

function navIndex(pathname: string) {
  return NAV_ORDER.findIndex((href) => isActivePath(pathname, href))
}

function currentNavItem(pathname: string): NavItem {
  const items: NavItem[] = [
    ...SIDEBAR_GROUPS.flatMap((group) => group.items),
    SETTINGS_NAV_ITEM,
    PROFILE_NAV_ITEM,
  ]
  return (
    items.find((item) => isActivePath(pathname, item.href, item.exact)) ?? {
      href: pathname,
      label: "Workspace",
      icon: LayoutGrid,
    }
  )
}

/** Each workspace page gets its own mark beside the title in the top bar. */
function PageTitleIcon({ pathname }: { pathname: string }) {
  const item = currentNavItem(pathname)
  const Icon = item.icon
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
      <Icon className="h-4 w-4" aria-hidden="true" />
    </span>
  )
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
          className="flex h-9 items-center gap-1.5 rounded-full border border-border bg-card py-1 pl-1 pr-2 transition-colors hover:bg-accent"
        >
          <UserAvatar src={avatarUrl} name={displayName} initials={initials} size={28} />
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

function WorkspaceSidebar({ pathname }: { pathname: string }) {
  return (
    <Sidebar
      collapsible="icon"
      className="after:pointer-events-none after:absolute after:inset-y-0 after:left-full after:ml-[3px] after:h-full after:w-px after:bg-sidebar-border after:content-['']"
    >
      <SidebarHeader
        className={cn(
          BAR_HEIGHT,
          "relative shrink-0 justify-center border-b border-sidebar-border py-0 pl-2.5 pr-3 after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:mt-[3px] after:h-px after:bg-sidebar-border after:content-[''] group-data-[collapsible=icon]:px-2"
        )}
      >
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              tooltip="Minimalist Toolkit"
              className="h-12 gap-2.5 px-1.5 data-[size=lg]:h-12 group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            >
              <Link href="/app/dashboard">
                <BrandLogo size={28} />
                <div className="grid min-w-0 flex-1 overflow-hidden text-left leading-tight transition-opacity duration-200 group-data-[collapsible=icon]:hidden">
                  <span className="truncate text-sm font-medium">Minimalist Toolkit</span>
                  <span className="truncate text-xs text-muted-foreground">One account for every tool</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0 py-2">

        {SIDEBAR_GROUPS.map((group) => {
          return (
            <Fragment key={group.label}>
              <SidebarGroup className="mt-5 px-3 py-0 first:mt-2 group-data-[collapsible=icon]:mt-0">
                <SidebarGroupLabel className="h-6 px-1 text-xs font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">
                  <span>{group.label}</span>
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon
                      const active = isActivePath(pathname, item.href, item.exact)
                      return (
                        <SidebarMenuItem key={item.href}>
                          <Link
                            href={item.href}
                            aria-current={active ? "page" : undefined}
                            className={cn(
                              "flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
                              active
                                ? "bg-sidebar-foreground text-sidebar font-medium"
                                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                            )}
                          >
                            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                            <span className="truncate group-data-[collapsible=icon]:hidden">{item.label}</span>
                          </Link>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </Fragment>
          )
        })}
      </SidebarContent>

      <SidebarFooter className="gap-0 p-0">
        <div className="border-t border-sidebar-border p-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
          <SidebarTrigger
            title="Collapse sidebar (Ctrl+B or Command+B)"
            className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
          >
            <span className="truncate group-data-[collapsible=icon]:hidden">Collapse</span>
            <kbd className="ml-auto rounded border border-sidebar-border px-1.5 text-xs leading-4 text-muted-foreground group-data-[collapsible=icon]:hidden">
              B
            </kbd>
          </SidebarTrigger>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

/**
 * Slides the incoming page in from the right when someone moves forward
 * through the sidebar, and from the left when they move back.
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

export function AppShell({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const pathname = usePathname()

  return (
    <SidebarProvider defaultOpen={defaultOpen} className="h-dvh overflow-hidden">
      <WorkspaceSidebar pathname={pathname} />
      <SidebarInset className="min-h-0 overflow-hidden">
        <header className={cn(BAR_HEIGHT, "relative flex shrink-0 items-center gap-2 border-b border-border bg-background px-3 sm:px-4 after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:mt-[3px] after:h-px after:bg-border after:content-['']")}>
          <SidebarTrigger className="h-8 w-8 rounded-md border border-border bg-card md:hidden" />
          <PageTitleIcon pathname={pathname} />
          <p className="truncate text-sm font-medium">{currentNavItem(pathname).label}</p>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <ThemeIconButton className="h-8 w-8 rounded-full border border-border bg-card" />
            <AccountMenu />
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-background text-foreground">
          <PageTransition pathname={pathname}>{children}</PageTransition>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
