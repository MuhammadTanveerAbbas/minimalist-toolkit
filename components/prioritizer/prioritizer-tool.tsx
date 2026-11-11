"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  Cloud,
  Database,
  Plus,
  Save,
  Target,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { useToolDocuments } from "@/lib/persistence/use-tool-documents"
import { rankItems, rescaleItem, defaultCriteria, type RankedItem } from "@/lib/prioritizer/scoring"
import { fragilityAnalysis, scoreSpread, type FragilityResult } from "@/lib/prioritizer/analysis"
import { toCsv, toMarkdown } from "@/lib/prioritizer/export"
import {
  DEFAULT_PROJECT_TITLE,
  createEmptyProject,
  type PrioritizationDocument,
  type PrioritizationItem,
  type PrioritizationProject,
} from "@/lib/prioritizer/types"
import { CriteriaPanel } from "./criteria-panel"
import { ScoreInputs } from "./score-inputs"
import { RankingTable } from "./ranking-table"
import { FragilityReport } from "./fragility-report"
import { DecisionRecord } from "./decision-record"
import { cn } from "@/lib/utils"

type Tab = "ranking" | "fragility" | "record"

const TABS: { id: Tab; label: string }[] = [
  { id: "ranking", label: "Ranking" },
  { id: "fragility", label: "Fragility" },
  { id: "record", label: "Decision record" },
]

function newItem(): PrioritizationItem {
  return {
    id: crypto.randomUUID(),
    name: "",
    description: "",
    reach: 100,
    impact: 1,
    confidence: 0.8,
    effort: 1,
    costOfDelay: 1,
    jobSize: 1,
    evidence: {},
  }
}

export function PrioritizerTool() {
  const { documents, mode, error, create, update, remove, setError } =
    useToolDocuments<PrioritizationDocument>("prioritizer")

  const [activeDocId, setActiveDocId] = useState<string | null>(null)
  // Null means "use the saved title". A string means the user has typed one.
  const [nameDraft, setNameDraft] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>("ranking")
  const [editingItem, setEditingItem] = useState<PrioritizationItem | null>(null)
  const [percent, setPercent] = useState(20)
  const [dirty, setDirty] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null)
  // An edited copy of the open project. Null means "use the saved version".
  const [draft, setDraft] = useState<PrioritizationProject | null>(null)

  // The open project is derived from the selected id rather than pushed into
  // state by an effect, so there is a single source of truth.
  const selectedDocId = activeDocId ?? documents[0]?.id ?? null
  const selectedDoc = useMemo(
    () => documents.find((doc) => doc.id === selectedDocId) ?? null,
    [documents, selectedDocId]
  )

  const project = useMemo<PrioritizationProject>(() => {
    if (draft) return draft
    if (!selectedDoc) return { ...createEmptyProject(), criteria: defaultCriteria("RICE") }
    const { id: _id, ...rest } = selectedDoc.data
    return {
      ...rest,
      criteria:
        rest.criteria && rest.criteria.length > 0 ? rest.criteria : defaultCriteria(rest.framework),
    }
  }, [draft, selectedDoc])

  // The name is edited separately from the project data, so the saved title is
  // used until the user types a new one.
  const effectiveName = nameDraft ?? selectedDoc?.title ?? DEFAULT_PROJECT_TITLE

  const ranked: RankedItem[] = useMemo(() => rankItems(project.items, project), [project])
  const fragility: FragilityResult[] = useMemo(
    () => fragilityAnalysis(project.items, project, percent),
    [percent, project]
  )
  const spread = useMemo(() => scoreSpread(project.items, project), [project])

  const markdown = useMemo(
    () =>
      toMarkdown(project, ranked, fragility, {
        projectName: effectiveName,
        perturbationPercent: percent,
      }),
    [effectiveName, fragility, percent, project, ranked]
  )
  const csv = useMemo(() => toCsv(project, ranked), [project, ranked])

  const updateProject = useCallback((next: PrioritizationProject) => {
    setDraft(next)
    setDirty(true)
  }, [])

  const handleSave = useCallback(async () => {
    const payload: PrioritizationDocument = { ...project, id: selectedDocId ?? "new" }
    try {
      if (selectedDocId) {
        await update(selectedDocId, { title: effectiveName, data: payload })
      } else {
        const doc = await create(effectiveName, payload)
        setActiveDocId(doc.id)
      }
      setDraft(null)
      setDirty(false)
      setSavedFlash(true)
      window.setTimeout(() => setSavedFlash(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the project.")
    }
  }, [create, effectiveName, project, selectedDocId, setError, update])

  const handleNew = useCallback(() => {
    setActiveDocId(null)
    setNameDraft(null)
    setDraft({ ...createEmptyProject(), criteria: defaultCriteria("RICE") })
    setEditingItem(null)
    setDirty(false)
    setTab("ranking")
  }, [])

  const handleDeleteDocument = useCallback(
    async (id: string) => {
      await remove(id)
      setDeletingDocId(null)
      if (id === activeDocId) handleNew()
    },
    [activeDocId, handleNew, remove]
  )

  const addItem = useCallback(() => {
    const item = newItem()
    setEditingItem(item)
  }, [])

  const commitItem = useCallback(
    (updated: PrioritizationItem) => {
      const exists = project.items.some((entry) => entry.id === updated.id)
      const items = exists
        ? project.items.map((entry) => (entry.id === updated.id ? updated : entry))
        : [...project.items, updated]
      updateProject({ ...project, items })
      setEditingItem(null)
    },
    [project, updateProject]
  )

  const removeItem = useCallback(
    (id: string) => {
      updateProject({ ...project, items: project.items.filter((entry) => entry.id !== id) })
      setEditingItem(null)
    },
    [project, updateProject]
  )

  const changeFramework = useCallback(
    (framework: PrioritizationProject["framework"]) => {
      const items = project.items.map((item) => rescaleItem(item, project.framework, framework))
      updateProject({
        ...project,
        framework,
        items,
        criteria: defaultCriteria(framework),
      })
    },
    [project, updateProject]
  )

  const isLoading = mode === "loading"

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Prioritizer</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Score features, test whether the ranking holds, and export the reasoning.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-[11px] text-muted-foreground"
            title={
              mode === "database"
                ? "Saved to your account"
                : mode === "local"
                  ? "Saved in this browser"
                  : "Loading"
            }
          >
            {mode === "database" ? (
              <Database className="h-3 w-3" aria-hidden="true" />
            ) : (
              <Cloud className="h-3 w-3" aria-hidden="true" />
            )}
            {mode === "database" ? "Saved to your account" : mode === "local" ? "Saved in this browser" : "Loading"}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={handleNew} className="gap-1.5">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New project
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isLoading}
            className="gap-1.5"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {savedFlash ? "Saved" : "Save"}
          </Button>
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}

      {documents.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Label htmlFor="project-picker" className="text-xs text-muted-foreground">
            Project
          </Label>
          <Select
            value={selectedDocId ?? "new"}
            onValueChange={(value) => {
              if (value === "new") {
                handleNew()
                return
              }
              const doc = documents.find((entry) => entry.id === value)
              if (!doc) return
              setActiveDocId(doc.id)
              setNameDraft(null)
              setDraft(null)
              setDirty(false)
            }}
          >
            <SelectTrigger id="project-picker" className="h-9 w-auto min-w-[200px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Unsaved project</SelectItem>
              {documents.map((doc) => (
                <SelectItem key={doc.id} value={doc.id}>
                  {doc.title || DEFAULT_PROJECT_TITLE}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedDocId ? (
            <button
              type="button"
              onClick={() => setDeletingDocId(selectedDocId)}
              aria-label="Delete this project"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ) : null}
          {dirty ? (
            <span className="text-xs text-muted-foreground">Unsaved changes</span>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        {/* Left column: model and inputs */}
        <div className="flex flex-col gap-4">
          <section className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="project-name" className="text-xs font-medium">
                Project name
              </Label>
              <Input
                id="project-name"
                value={effectiveName}
                onChange={(e) => {
                  setNameDraft(e.target.value)
                  setDirty(true)
                }}
                placeholder={DEFAULT_PROJECT_TITLE}
                className="h-9 text-sm"
              />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Scoring model</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              The formula decides how each feature is scored. Switching rescales the existing numbers so
              your intent survives the change.
            </p>
            <div className="mt-4">
              <CriteriaPanel project={project} onChange={updateProject} />
            </div>
            {project.mode === "framework" ? (
              <button
                type="button"
                onClick={() => changeFramework(project.framework === "RICE" ? "ICE" : "RICE")}
                className="mt-3 text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Try {project.framework === "RICE" ? "ICE" : "RICE"} instead
              </button>
            ) : null}
          </section>

          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Features</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {project.items.length === 0
                ? "Nothing scored yet."
                : `${project.items.length} scored.`}
            </p>
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="mt-3 gap-1.5">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add feature
            </Button>
          </section>
        </div>

        {/* Right column: results */}
        <div className="min-w-0">
          <div
            role="tablist"
            aria-label="Prioritizer views"
            className="flex gap-1 rounded-lg border border-border bg-card p-1"
          >
            {TABS.map((item) => (
              <button
                key={item.id}
                role="tab"
                type="button"
                aria-selected={tab === item.id}
                onClick={() => setTab(item.id)}
                className={cn(
                  "min-h-9 flex-1 rounded-md px-3 text-xs font-medium transition-colors",
                  tab === item.id
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-4">
            {isLoading ? (
              <div className="flex flex-col gap-3">
                <Skeleton className="h-10" />
                <Skeleton className="h-64" />
              </div>
            ) : tab === "ranking" ? (
              project.items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-surface-2 p-8 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-card">
                    <Target className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  </span>
                  <h2 className="mt-4 text-base font-semibold">Add your first feature</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    Score each option against the model you chose. Once there are two or more features,
                    the ranking and the fragility check become meaningful.
                  </p>
                  <Button type="button" onClick={addItem} size="sm" className="mt-5 gap-1.5">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    Add feature
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="text-xs text-muted-foreground">Top score</p>
                      <p className="mt-1.5 text-xl font-semibold tabular-nums tracking-tight">
                        {spread.max}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="text-xs text-muted-foreground">Gap to second</p>
                      <p className="mt-1.5 text-xl font-semibold tabular-nums tracking-tight">
                        {spread.gap}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {spread.gap < spread.max * 0.1 ? "A close contest" : "The lead is decided"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                      <p className="text-xs text-muted-foreground">Average score</p>
                      <p className="mt-1.5 text-xl font-semibold tabular-nums tracking-tight">
                        {spread.mean}
                      </p>
                    </div>
                  </div>

                  <RankingTable
                    ranked={ranked}
                    project={project}
                    fragility={fragility}
                    onEdit={setEditingItem}
                  />
                </div>
              )
            ) : tab === "fragility" ? (
              <FragilityReport
                fragility={fragility}
                items={project.items}
                percent={percent}
                onPercentChange={setPercent}
              />
            ) : (
              <DecisionRecord markdown={markdown} projectName={effectiveName} csv={csv} />
            )}
          </div>
        </div>
      </div>

      {/* Item editor */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
          <VisuallyHidden.Root>
            <DialogTitle>{editingItem?.name || "Feature"}</DialogTitle>
          </VisuallyHidden.Root>
          {editingItem ? (
            <div className="p-5">
              <h2 className="text-base font-semibold">
                {project.items.some((entry) => entry.id === editingItem.id)
                  ? "Edit feature"
                  : "New feature"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Numbers are clamped to the valid range for the current model, so the score can never be
                undefined.
              </p>
              <div className="mt-5">
                <ScoreInputs
                  item={editingItem}
                  project={project}
                  onChange={setEditingItem}
                  onDelete={() => removeItem(editingItem.id)}
                />
              </div>
              <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
                <Button type="button" variant="ghost" onClick={() => setEditingItem(null)}>
                  Cancel
                </Button>
                <Button type="button" onClick={() => commitItem(editingItem)}>
                  {project.items.some((entry) => entry.id === editingItem.id) ? "Save changes" : "Add"}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingDocId}
        onOpenChange={(open) => !open && setDeletingDocId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the saved project and its scores. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingDocId && handleDeleteDocument(deletingDocId)}
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
