"use client"

import { useState, useRef, useCallback, useMemo } from "react"
import type { Snippet } from "@/lib/types"
import { useSnippets } from "@/hooks/use-snippets"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { getSnippetCounts } from "@/lib/snippet-stats"
import { Sidebar } from "@/components/sidebar"
import { SearchBar, type SnippetSort } from "@/components/search-bar"
import { SnippetList } from "@/components/snippet-list"
import { SnippetForm } from "@/components/snippet-form"
import { SnippetViewer } from "@/components/snippet-viewer"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Plus, Code2, Check } from "lucide-react"
import { ExportImportDialog } from "@/components/export-import-dialog"
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SnippetWorkspace() {
  const {
    snippets,
    allSnippets,
    filters,
    setFilters,
    allTags,
    allCategories,
    createSnippet,
    updateSnippet,
    deleteSnippet,
    duplicateSnippet,
    exportJSON,
    importJSON,
    exportGist,
    isLoaded,
  } = useSnippets()

  const [formOpen, setFormOpen] = useState(false)
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null)
  const [viewingSnippet, setViewingSnippet] = useState<Snippet | null>(null)
  const [deletingSnippetId, setDeletingSnippetId] = useState<string | null>(null)
  const [sort, setSort] = useState<SnippetSort>("updated")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const snippetCounts = getSnippetCounts(allSnippets)

  const hasFilters =
    !!filters.search ||
    !!filters.language ||
    !!filters.category ||
    (filters.tags && filters.tags.length > 0) ||
    !!filters.visibility

  const sortedSnippets = useMemo(() => {
    const list = [...snippets]
    switch (sort) {
      case "created":
        return list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      case "title":
        return list.sort((a, b) => a.title.localeCompare(b.title))
      case "lines":
        return list.sort((a, b) => b.code.split("\n").length - a.code.split("\n").length)
      default:
        return list.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    }
  }, [snippets, sort])

  const handleNewSnippet = useCallback(() => {
    setEditingSnippet(null)
    setFormOpen(true)
  }, [])

  const handleEditSnippet = useCallback((snippet: Snippet) => {
    setEditingSnippet(snippet)
    setViewingSnippet(null)
    setFormOpen(true)
  }, [])

  const handleSaveSnippet = useCallback(
    async (data: Omit<Snippet, "id" | "createdAt" | "updatedAt" | "versions">) => {
      if (editingSnippet) {
        await updateSnippet(editingSnippet.id, data)
      } else {
        await createSnippet(data)
      }
      setFormOpen(false)
      setEditingSnippet(null)
    },
    [editingSnippet, updateSnippet, createSnippet]
  )

  const handleDeleteSnippet = useCallback(
    async (id: string) => {
      await deleteSnippet(id)
      setDeletingSnippetId(null)
      setViewingSnippet(null)
    },
    [deleteSnippet]
  )

  const handleDuplicateSnippet = useCallback(
    async (id: string) => {
      await duplicateSnippet(id)
      setViewingSnippet(null)
    },
    [duplicateSnippet]
  )

  const handleCopySnippet = useCallback(async (snippet: Snippet) => {
    try {
      await navigator.clipboard.writeText(snippet.code)
      setCopiedId(snippet.id)
      window.setTimeout(() => setCopiedId(null), 1800)
    } catch {
      // Clipboard access can be denied. The viewer still allows manual copy.
    }
  }, [])

  useKeyboardShortcuts([
    { key: "n", ctrl: true, description: "Create new snippet", handler: () => handleNewSnippet() },
    { key: "k", ctrl: true, description: "Focus search", handler: () => searchInputRef.current?.focus() },
    { key: "/", description: "Focus search", handler: () => searchInputRef.current?.focus() },
    {
      key: "Escape",
      description: "Close dialogs",
      handler: () => {
        setFormOpen(false)
        setViewingSnippet(null)
        setDeletingSnippetId(null)
      },
    },
  ])

  if (!isLoaded) {
    return (
      <div className="flex h-[calc(100dvh-3.5rem-4rem-env(safe-area-inset-bottom))] items-center justify-center bg-background px-4 md:h-[calc(100dvh-3.5rem-1.5rem)]">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card">
            <Code2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Loading your snippets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100dvh-3.5rem-4rem-env(safe-area-inset-bottom))] flex-col overflow-hidden bg-background md:h-[calc(100dvh-3.5rem-1.5rem)]">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-background px-3 py-2 sm:px-4">
        <div>
          <h1 className="text-sm font-semibold">Snippet Manager</h1>
          <p className="text-xs text-muted-foreground">Your private code library</p>
        </div>
        <div className="flex items-center gap-1">
          <ExportImportDialog onExportJSON={exportJSON} onImportJSON={importJSON} onExportGist={exportGist} />
          <KeyboardShortcutsDialog />
          <Button onClick={handleNewSnippet} size="sm" variant="secondary" className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New snippet</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          allTags={allTags}
          allCategories={allCategories}
          filters={filters}
          onFiltersChange={setFilters}
          snippetCounts={snippetCounts}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl space-y-5 p-4 pb-24 sm:p-6 md:pb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SearchBar
                filters={filters}
                onFiltersChange={setFilters}
                allTags={allTags}
                allCategories={allCategories}
                searchInputRef={searchInputRef}
                sort={sort}
                onSortChange={setSort}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {sortedSnippets.length} snippet{sortedSnippets.length !== 1 ? "s" : ""}
                {hasFilters ? " matching filters" : ""}
                {copiedId ? (
                  <span className="ml-2 inline-flex items-center gap-1 text-success">
                    <Check className="h-3 w-3" aria-hidden="true" />
                    Code copied
                  </span>
                ) : null}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Sort</span>
                <Select value={sort} onValueChange={(v) => setSort(v as SnippetSort)}>
                  <SelectTrigger className="h-8 w-auto gap-2 border-border bg-card text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated">Recently updated</SelectItem>
                    <SelectItem value="created">Recently created</SelectItem>
                    <SelectItem value="title">Title (A to Z)</SelectItem>
                    <SelectItem value="lines">Longest first</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <SnippetList
              snippets={sortedSnippets}
              onEdit={handleEditSnippet}
              onDelete={(id) => setDeletingSnippetId(id)}
              onDuplicate={handleDuplicateSnippet}
              onCopy={handleCopySnippet}
              onView={(snippet) => setViewingSnippet(snippet)}
              onCreate={handleNewSnippet}
              hasFilters={hasFilters}
            />
          </div>
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent
          showCloseButton={false}
          className="m-0 max-h-dvh w-full max-w-4xl overflow-y-auto rounded-none sm:m-4 sm:max-h-[92vh] sm:rounded-lg"
        >
          <VisuallyHidden.Root>
            <DialogTitle>{editingSnippet ? "Edit Snippet" : "New Snippet"}</DialogTitle>
          </VisuallyHidden.Root>
          <SnippetForm
            snippet={editingSnippet ?? undefined}
            onSave={handleSaveSnippet}
            onCancel={() => {
              setFormOpen(false)
              setEditingSnippet(null)
            }}
          />
        </DialogContent>
      </Dialog>

      <SnippetViewer
        snippet={viewingSnippet}
        open={!!viewingSnippet}
        onOpenChange={(open) => {
          if (!open) setViewingSnippet(null)
        }}
        onEdit={() => viewingSnippet && handleEditSnippet(viewingSnippet)}
        onDelete={() => viewingSnippet && setDeletingSnippetId(viewingSnippet.id)}
        onDuplicate={() => viewingSnippet && handleDuplicateSnippet(viewingSnippet.id)}
      />

      <AlertDialog
        open={!!deletingSnippetId}
        onOpenChange={(open) => {
          if (!open) setDeletingSnippetId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Snippet</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the snippet and all its version history. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingSnippetId && handleDeleteSnippet(deletingSnippetId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
