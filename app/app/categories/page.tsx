"use client"

import { useMemo, useState } from "react"
import {
  Check,
  Copy,
  FileText,
  Library,
  Pencil,
  Plus,
  Puzzle,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useVault, type VaultInput, type VaultItem, type VaultKind } from "@/hooks/use-vault"

const CONTAINER = "mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"

const KIND_META: Record<
  VaultKind,
  { label: string; icon: typeof FileText; hint: string }
> = {
  skill: { label: "Skill", icon: Sparkles, hint: "A reusable instruction or workflow" },
  prompt: { label: "Prompt", icon: FileText, hint: "A prompt you want to keep" },
  plugin: { label: "Plugin", icon: Puzzle, hint: "A tool, integration or extension note" },
}

const EMPTY_FORM: VaultInput = {
  kind: "prompt",
  title: "",
  description: "",
  content: "",
  category: "",
  tags: [],
}

function parseTags(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  ).slice(0, 12)
}

export default function VaultPage() {
  const { items, isLoaded, categories, counts, createItem, updateItem, deleteItem } = useVault()
  const [query, setQuery] = useState("")
  const [kind, setKind] = useState<"all" | VaultKind>("all")
  const [category, setCategory] = useState("all")
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<VaultInput>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      if (kind !== "all" && item.kind !== kind) return false
      if (category !== "all" && item.category !== category) return false
      if (!q) return true
      return [item.title, item.description, item.content, item.category, ...item.tags]
        .join(" ")
        .toLowerCase()
        .includes(q)
    })
  }, [items, query, kind, category])

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError(null)
    setOpen(true)
  }

  function openEdit(item: VaultItem) {
    setEditingId(item.id)
    setForm({
      kind: item.kind,
      title: item.title,
      description: item.description,
      content: item.content,
      category: item.category,
      tags: item.tags,
    })
    setError(null)
    setOpen(true)
  }

  async function submit() {
    if (!form.title.trim()) {
      setError("Give this item a title.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (editingId) await updateItem(editingId, form)
      else await createItem(form)
      setOpen(false)
    } catch {
      setError("Could not save this item. Try again.")
    } finally {
      setSaving(false)
    }
  }

  async function remove(item: VaultItem) {
    if (!window.confirm(`Delete "${item.title}"?`)) return
    try {
      await deleteItem(item.id)
    } catch {
      setError("Could not delete this item. Try again.")
    }
  }

  async function copy(item: VaultItem) {
    try {
      await navigator.clipboard.writeText(item.content)
      setCopiedId(item.id)
      window.setTimeout(() => setCopiedId(null), 1500)
    } catch {
      // Clipboard may be unavailable.
    }
  }

  const stats = [
    { label: "Total items", value: counts.total },
    { label: "Skills", value: counts.skill },
    { label: "Prompts", value: counts.prompt },
    { label: "Plugins", value: counts.plugin },
  ]

  return (
    <div className={CONTAINER}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-tight sm:text-3xl">Vault</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            A private library for the skills, prompts and plugin notes you reuse. Group them by category and
            copy them straight into your workflow.
          </p>
        </div>
        <Button onClick={openCreate} className="shrink-0">
          <Plus className="h-4 w-4" aria-hidden="true" />
          New item
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-2xl font-medium tabular-nums tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your vault..."
            aria-label="Search vault"
            className="h-10 pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by kind">
          {(["all", "skill", "prompt", "plugin"] as const).map((option) => (
            <Button
              key={option}
              type="button"
              variant={kind === option ? "secondary" : "outline"}
              size="sm"
              onClick={() => setKind(option)}
              aria-pressed={kind === option}
              className="capitalize"
            >
              {option === "all" ? "All" : `${KIND_META[option].label}s`}
            </Button>
          ))}
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-10 sm:w-44" aria-label="Filter by category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && !open ? (
        <p className="mt-4 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-muted-foreground">
          {error}
        </p>
      ) : null}

      {!isLoaded ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-44" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-surface-2 p-8 text-center">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card">
            <Library className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-base font-medium">{items.length ? "Nothing matches" : "Your vault is empty"}</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
            {items.length
              ? "Try a different search, kind or category."
              : "Save a skill, a prompt or a plugin note to start building your library."}
          </p>
          {!items.length ? (
            <Button onClick={openCreate} className="mt-4">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add first item
            </Button>
          ) : null}
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => {
            const Meta = KIND_META[item.kind]
            const Icon = Meta.icon
            return (
              <li key={item.id}>
                <article className="flex h-full flex-col rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{item.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{item.category || "Uncategorised"}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {Meta.label}
                    </Badge>
                  </div>

                  {item.description ? (
                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground">{item.description}</p>
                  ) : null}

                  {item.content ? (
                    <pre className="mt-3 max-h-24 overflow-hidden whitespace-pre-wrap break-words rounded-lg border border-border bg-surface-2 p-2.5 font-mono text-[11px] leading-5">
                      {item.content}
                    </pre>
                  ) : null}

                  {item.tags.length ? (
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {item.tags.slice(0, 4).map((tag) => (
                        <li key={tag} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {tag}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <div className="mt-auto flex items-center gap-1 border-t border-border pt-3">
                    <Button variant="ghost" size="sm" onClick={() => copy(item)} aria-label="Copy content">
                      {copiedId === item.id ? (
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {copiedId === item.id ? "Copied" : "Copy"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(item)} aria-label="Edit item">
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(item)}
                      aria-label="Delete item"
                      className="ml-auto text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-tight">
              {editingId ? "Edit item" : "New vault item"}
            </DialogTitle>
            <DialogDescription>Save something you want to reuse across your work.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="vault-kind">Type</Label>
                <Select
                  value={form.kind}
                  onValueChange={(value) => setForm((current) => ({ ...current, kind: value as VaultKind }))}
                >
                  <SelectTrigger id="vault-kind">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(KIND_META) as VaultKind[]).map((key) => (
                      <SelectItem key={key} value={key}>
                        {KIND_META[key].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{KIND_META[form.kind].hint}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="vault-category">Category</Label>
                <Input
                  id="vault-category"
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                  placeholder="e.g. Writing, DevOps"
                  maxLength={100}
                  className="h-10"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vault-title">Title</Label>
              <Input
                id="vault-title"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="Name this item"
                maxLength={200}
                className="h-10"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vault-description">Description (optional)</Label>
              <Textarea
                id="vault-description"
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="What is it for?"
                maxLength={2000}
                className="h-20 resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vault-content">Content</Label>
              <Textarea
                id="vault-content"
                value={form.content}
                onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                placeholder="Paste the skill, prompt or plugin note..."
                maxLength={20000}
                className="h-40 resize-none font-mono text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vault-tags">Tags (comma separated)</Label>
              <Input
                id="vault-tags"
                value={form.tags.join(", ")}
                onChange={(event) =>
                  setForm((current) => ({ ...current, tags: parseTags(event.target.value) }))
                }
                placeholder="react, sql, writing"
                className="h-10"
              />
            </div>

            {error ? <p className="text-sm text-muted-foreground">{error}</p> : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? "Saving..." : editingId ? "Save changes" : "Add to vault"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
