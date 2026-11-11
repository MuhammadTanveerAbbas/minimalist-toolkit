"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  Database,
  ExternalLink,
  Keyboard,
  Monitor,
  Palette,
  ShieldCheck,
  Smartphone,
  Trash2,
  User,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { TOOLS } from "@/lib/navigation"

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
    <section className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2">
            <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
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

/** Keys written by the browser-only parts of the workspace. */
const LOCAL_KEYS = [
  "mockify_history",
  "mockify_settings",
  "promptcraft_history",
  "toolkit_quotes_documents",
  "toolkit_prioritizer_documents",
  "workspace-sidebar-collapsed",
]

export default function SettingsPage() {
  const [email, setEmail] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [createdAt, setCreatedAt] = useState<string | null>(null)
  const [cleared, setCleared] = useState(false)

  useEffect(() => {
    let active = true
    createClient()
      .auth.getUser()
      .then(({ data }: { data: { user?: { email?: string | null; id?: string; created_at?: string } | null } | null }) => {
        if (!active) return
        setEmail(data?.user?.email ?? null)
        setUserId(data?.user?.id ?? null)
        setCreatedAt(data?.user?.created_at ?? null)
      })
    return () => {
      active = false
    }
  }, [])

  const clearLocalData = () => {
    for (const key of LOCAL_KEYS) {
      try {
        localStorage.removeItem(key)
      } catch {
        // Storage may be unavailable. Clearing is best effort.
      }
    }
    setCleared(true)
    window.setTimeout(() => setCleared(false), 2500)
  }

  return (
    <div className={CONTAINER}>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Settings</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        Your account details, how the workspace looks, and what stays on this device.
      </p>

      <div className="mt-6 space-y-4">
        <SettingsCard icon={User} title="Account" description="Details for the account you signed in with.">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface-2 p-3">
              <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Email
              </dt>
              <dd className="mt-1 break-all text-sm font-medium">{email ?? "Signed in"}</dd>
            </div>
            <div className="rounded-lg border border-border bg-surface-2 p-3">
              <dt className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Account created
              </dt>
              <dd className="mt-1 text-sm font-medium">
                {createdAt
                  ? new Date(createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Unavailable"}
              </dd>
            </div>
          </dl>
          {userId ? (
            <p className="mt-3 truncate font-mono text-[11px] text-muted-foreground/70">
              Account id {userId}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/app/profile"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-accent"
            >
              View profile
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            </Link>
            <Link
              href="/forgot-password"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-accent"
            >
              Account help
            </Link>
          </div>
        </SettingsCard>

        <SettingsCard icon={Palette} title="Appearance" description="How the workspace is laid out.">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg border border-border bg-surface-2 p-3">
              <Monitor className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium">Desktop layout</p>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                  Collapsible sidebar with grouped navigation and a persistent account menu.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border bg-surface-2 p-3">
              <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium">Mobile layout</p>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                  Bottom tab bar, sheet-based filters, and stacked data views.
                </p>
              </div>
            </div>
          </div>
        </SettingsCard>

        <SettingsCard
          icon={ShieldCheck}
          title="Privacy and security"
          description="How your data is protected and what lives only in this browser."
        >
          <ul className="space-y-2.5 text-sm leading-6 text-muted-foreground">
            <li className="flex gap-2">
              <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
              Your session is stored in an HttpOnly cookie with SameSite protection, so page scripts cannot
              read it.
            </li>
            <li className="flex gap-2">
              <Database className="mt-1 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
              Saved snippets, quotes and scoring projects are owned by your account id and enforced by
              database policies, not by the interface.
            </li>
            <li className="flex gap-2">
              <Keyboard className="mt-1 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
              Sign-in and callback endpoints are rate limited to slow automated abuse.
            </li>
          </ul>

          <div className="mt-4 flex flex-col gap-3 rounded-lg border border-border bg-surface-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Clear local tool data</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Removes cached history, generated images and offline copies from this browser only. Your
                account data is not affected.
              </p>
            </div>
            <button
              type="button"
              onClick={clearLocalData}
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium transition-colors hover:border-destructive/40 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {cleared ? "Cleared" : "Clear local data"}
            </button>
          </div>
        </SettingsCard>

        <SettingsCard icon={Keyboard} title="Tools" description="Jump straight to a workspace tool.">
          <div className="grid gap-2 sm:grid-cols-2">
            {TOOLS.map((tool) => (
              <Link
                key={tool.id}
                href={tool.href}
                className="flex min-h-11 items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 text-sm font-medium transition-colors hover:bg-accent"
              >
                <tool.icon className="h-4 w-4 text-muted-foreground" style={{ color: tool.accent }} aria-hidden="true" />
                <span className="truncate">{tool.name}</span>
              </Link>
            ))}
          </div>
        </SettingsCard>
      </div>
    </div>
  )
}
