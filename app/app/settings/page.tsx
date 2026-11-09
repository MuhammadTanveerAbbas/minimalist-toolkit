"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  User,
  Palette,
  ShieldCheck,
  Monitor,
  Smartphone,
  Trash2,
  ExternalLink,
  Code2,
  ImageIcon,
  Sparkles,
  MessageSquareText,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useTheme } from "@/hooks/use-theme"
import { ThemeToggle } from "@/components/theme-toggle"

const CONTAINER = "mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8"

function SettingsCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="animate-fade-up rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold sm:text-base">{title}</h2>
            {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
          </div>
        </div>
      </div>
      <div className="px-4 py-4 sm:px-5">{children}</div>
    </section>
  )
}

const LOCAL_KEYS = ["mockify_history", "mockify_settings", "promptcraft_history"]

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme()
  const [email, setEmail] = useState<string | null>(null)
  const [cleared, setCleared] = useState(false)

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }: { data: { user: { email?: string | null } | null } | null }) =>
        setEmail(data?.user?.email ?? null)
      )
  }, [])

  const clearLocalData = () => {
    for (const key of LOCAL_KEYS) {
      try {
        localStorage.removeItem(key)
      } catch {}
    }
    setCleared(true)
    window.setTimeout(() => setCleared(false), 2500)
  }

  return (
    <div className={CONTAINER}>
      <div className="animate-fade-up">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Settings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Manage your account details, appearance, and workspace preferences.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <SettingsCard icon={User} title="Account" description="Your current sign-in information.">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-background p-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Email</dt>
              <dd className="mt-1 break-all text-sm font-medium">{email ?? "Signed in"}</dd>
            </div>
            <div className="rounded-lg border border-border bg-background p-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Workspace</dt>
              <dd className="mt-1 text-sm font-medium">Minimalist Toolkit</dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/app/profile"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium transition-colors duration-150 hover:bg-muted/40"
            >
              View profile <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
            <Link
              href="/forgot-password"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium transition-colors duration-150 hover:bg-muted/40"
            >
              Account help
            </Link>
          </div>
        </SettingsCard>

        <SettingsCard icon={Palette} title="Appearance" description="Choose how the workspace looks on this device.">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your preference is saved in this browser and applied across the workspace.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground capitalize">{theme}</span>
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
              <Monitor className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Desktop layout</p>
                <p className="text-xs text-muted-foreground">Sidebar navigation with grouped sections.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Mobile layout</p>
                <p className="text-xs text-muted-foreground">Compact header and collapsible navigation.</p>
              </div>
            </div>
          </div>
        </SettingsCard>

        <SettingsCard icon={ShieldCheck} title="Privacy" description="Simple controls for your workspace data.">
          <div className="space-y-3 text-sm leading-6 text-muted-foreground">
            <p>Your account data is used to keep your workspace personal to you when you are signed in.</p>
            <p>Some tools may store recent activity in this browser for convenience. You can clear that local data below.</p>
          </div>
          <div className="mt-4 flex flex-col gap-3 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Clear local tool history</p>
              <p className="mt-1 text-sm text-muted-foreground">Removes saved Mockify and PromptCraft history from this browser only.</p>
            </div>
            <button
              type="button"
              onClick={clearLocalData}
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-medium transition-colors duration-150 hover:bg-muted/40"
            >
              <Trash2 className="h-4 w-4" /> {cleared ? "Cleared" : "Clear local data"}
            </button>
          </div>
        </SettingsCard>

        <SettingsCard icon={Code2} title="Quick links" description="Jump to tools and workspace areas.">
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { href: "/app/snippets", label: "Snippet Manager", icon: Code2 },
              { href: "/app/mockify", label: "Mockify", icon: ImageIcon },
              { href: "/app/promptcraft", label: "PromptCraft", icon: Sparkles },
              { href: "/app/chat", label: "AI chat", icon: MessageSquareText },
            ].map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex min-h-11 items-center gap-3 rounded-lg border border-border bg-background px-3 text-sm font-medium transition-colors duration-150 hover:bg-muted/40"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" /> {item.label}
                </Link>
              )
            })}
          </div>
        </SettingsCard>
      </div>
    </div>
  )
}
