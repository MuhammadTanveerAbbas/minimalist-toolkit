"use client"

import Link from "next/link"
import { useMemo } from "react"
import { ArrowRight, Code2, Command, FileText, ShieldCheck, Tag, Target } from "lucide-react"
import { useSnippets } from "@/hooks/use-snippets"
import { useUserProfile } from "@/hooks/use-user-profile"
import { getSnippetCounts } from "@/lib/snippet-stats"
import { LANGUAGE_NAMES } from "@/lib/editor-languages"
import { BarChart, CHART_COLORS } from "@/components/charts"
import { Skeleton } from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/workspace/user-avatar"
import type { Language } from "@/lib/types"

const CONTAINER = "mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8"

export default function ProfilePage() {
  const { name, email, avatarUrl, initials, createdAt } = useUserProfile()
  const { allSnippets, allCategories, allTags, isLoaded } = useSnippets()

  const displayName = name ?? "Your Google account"

  const counts = useMemo(() => getSnippetCounts(allSnippets), [allSnippets])

  const languages = useMemo(
    () =>
      Object.entries(counts.byLanguage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([lang, count], i) => ({
          label: LANGUAGE_NAMES[lang as Language] ?? lang,
          value: count,
          color: CHART_COLORS[i % CHART_COLORS.length],
        })),
    [counts.byLanguage]
  )

  return (
    <div className={CONTAINER}>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Profile</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        Your account and what you have saved so far.
      </p>

      {/* Identity */}
      <section className="mt-6 rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <UserAvatar
            src={avatarUrl}
            name={displayName}
            initials={initials}
            size={56}
            className="rounded-2xl"
          />
          <div className="min-w-0 flex-1">
            <p className="break-words text-lg font-semibold tracking-tight">{displayName}</p>
            <p className="mt-0.5 break-all text-sm text-muted-foreground">{email ?? "Signed in"}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {createdAt
                ? `Member since ${new Date(createdAt).toLocaleDateString(undefined, {
                    month: "long",
                    year: "numeric",
                  })}`
                : "Minimalist Toolkit account"}
            </p>
          </div>
          <Link
            href="/app/settings"
            className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-accent"
          >
            Settings
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-border bg-surface-2 p-3.5">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
          <p className="text-sm leading-6 text-muted-foreground">
            This account is bound to your Google identity. There is no separate password stored here, and
            every document you create is owned by your account id in the database.
          </p>
        </div>
      </section>

      {/* Usage */}
      <section className="mt-4 rounded-xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-sm font-semibold">Your library</h2>
        {!isLoaded ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Snippets saved", value: counts.total, icon: Code2 },
                { label: "Categories used", value: allCategories.length, icon: FileText },
                { label: "Tags in use", value: allTags.length, icon: Tag },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg border border-border bg-surface-2 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <stat.icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <p className="mt-1.5 text-xl font-semibold tabular-nums tracking-tight">{stat.value}</p>
                </div>
              ))}
            </div>

            {languages.length > 0 ? (
              <div className="mt-5 border-t border-border pt-4">
                <p className="mb-3 text-xs font-medium text-muted-foreground">Most used languages</p>
                <BarChart data={languages} />
              </div>
            ) : null}
          </>
        )}
      </section>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-card p-4">
        <Command className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">
          Your data is private to this account. Nothing here is shared with other members of a workspace.
        </p>
        <Target className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </div>
    </div>
  )
}
