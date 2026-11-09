"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  Code2,
  ImageIcon,
  Sparkles,
  ArrowRight,
  FolderOpen,
  Tag,
  Lock,
  Globe,
  Clock,
  MessageSquareText,
} from "lucide-react"
import { useSnippets } from "@/hooks/use-snippets"
import { getSnippetCounts } from "@/lib/snippet-stats"
import { LANGUAGE_NAMES } from "@/lib/editor-languages"
import type { Language } from "@/lib/types"

const CONTAINER = "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"

function StatCard({ label, value, icon: Icon }: { label: string; value: number | string; icon: React.ElementType }) {
  return (
    <div className="animate-fade-up rounded-xl border border-border bg-card p-4 transition-colors duration-150 hover:bg-muted/20">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  )
}

function readLocalJsonCount(key: string) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return 0
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.length : 0
  } catch {
    return 0
  }
}

export default function DashboardPage() {
  const { allSnippets, allCategories, allTags, isLoaded } = useSnippets()
  const [mockifyCount] = useState(() => (typeof window !== "undefined" ? readLocalJsonCount("mockify_history") : 0))

  const counts = useMemo(() => getSnippetCounts(allSnippets), [allSnippets])
  const topLanguages = useMemo(
    () => Object.entries(counts.byLanguage).sort((a, b) => b[1] - a[1]).slice(0, 6),
    [counts.byLanguage]
  )
  const recent = useMemo(
    () => [...allSnippets].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, 5),
    [allSnippets]
  )

  return (
    <div className={CONTAINER}>
      <div className="animate-fade-up">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Analytics and quick access for your Minimalist Toolkit workspace. Counts below reflect data available in this browser/session.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total snippets" value={isLoaded ? counts.total : "..."} icon={Code2} />
        <StatCard label="Categories" value={isLoaded ? allCategories.length : "..."} icon={FolderOpen} />
        <StatCard label="Tags" value={isLoaded ? allTags.length : "..."} icon={Tag} />
        <StatCard label="Mockify history (local)" value={mockifyCount} icon={ImageIcon} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className="animate-fade-up rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Recent snippets</h2>
            <Link href="/app/snippets" className="inline-flex min-h-10 items-center gap-1 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground">
              Open snippets <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          {!isLoaded ? (
            <p className="mt-4 text-sm text-muted-foreground">Loading snippets...</p>
          ) : recent.length === 0 ? (
            <div className="mt-4 rounded-lg border border-border bg-background p-4">
              <p className="text-sm font-medium">No snippets yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Create your first snippet to see activity here.</p>
              <Link href="/app/snippets" className="mt-3 inline-flex min-h-10 items-center rounded-lg bg-foreground px-3 text-sm font-medium text-background">
                Go to Snippets
              </Link>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-border rounded-lg border border-border bg-background">
              {recent.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{s.title}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(s.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-md border border-border bg-card px-2 py-1 text-[11px] text-muted-foreground">
                    {LANGUAGE_NAMES[s.language as Language] ?? s.language}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="animate-fade-up delay-1 rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold">Visibility</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5">
              <span className="flex items-center gap-2 text-sm"><Globe className="h-4 w-4 text-muted-foreground" /> Public</span>
              <span className="text-sm font-semibold">{isLoaded ? counts.public : "..."}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5">
              <span className="flex items-center gap-2 text-sm"><Lock className="h-4 w-4 text-muted-foreground" /> Private</span>
              <span className="text-sm font-semibold">{isLoaded ? counts.private : "..."}</span>
            </div>
          </div>
          <h3 className="mt-6 text-sm font-semibold">Top languages</h3>
          {!isLoaded ? (
            <p className="mt-3 text-sm text-muted-foreground">Loading...</p>
          ) : topLanguages.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No language data yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {topLanguages.map(([lang, n]) => (
                <li key={lang} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{LANGUAGE_NAMES[lang as Language] ?? lang}</span>
                  <span className="font-medium">{n}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-4 animate-fade-up rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold">Quick actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { href: "/app/snippets", title: "Manage snippets", text: "Create, edit, search, and organize code.", icon: Code2 },
            { href: "/app/categories", title: "Browse categories", text: "View snippet categories and counts.", icon: FolderOpen },
            { href: "/app/mockify", title: "Generate mockups", text: "Create images from prompts.", icon: ImageIcon },
            { href: "/app/chat", title: "Open AI chat", text: "Ask for help with code and prompts.", icon: MessageSquareText },
          ].map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className="group rounded-lg border border-border bg-background p-4 transition-colors duration-150 hover:bg-muted/20">
                <div className="flex items-center justify-between">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5" />
                </div>
                <h3 className="mt-3 text-sm font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.text}</p>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
