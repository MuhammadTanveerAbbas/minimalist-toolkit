"use client"

import type { Snippet } from "@/lib/types"
import { LANGUAGE_NAMES } from "@/lib/editor-languages"
import { CodeEditor } from "./code-editor"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import {
  Eye, EyeOff, Edit, Trash2, Copy, X,
  Tag, Folder, Clock, Calendar, FileCode2, ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SnippetViewerProps {
  snippet: Snippet | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
}

export function SnippetViewer({
  snippet,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onDuplicate,
}: SnippetViewerProps) {
  if (!snippet) return null

  const lang = LANGUAGE_NAMES[snippet.language]

  const border = "border-border"
  const textPrimary = "text-foreground"
  const textMuted = "text-muted-foreground"
  const textSub = "text-foreground/70"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "w-full max-w-6xl p-0 gap-0 overflow-hidden",
          "h-dvh sm:h-auto sm:max-h-[92vh]",
          "sm:rounded-2xl rounded-none",
          "fixed top-0 left-0 sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2",
          "translate-x-0 translate-y-0",
          "flex flex-col border bg-card",
          border,
          "shadow-2xl"
        )}
      >
        <VisuallyHidden.Root>
          <DialogTitle>{snippet.title}</DialogTitle>
        </VisuallyHidden.Root>

        {/* ── Title bar ── */}
        <div className="flex items-center gap-3 px-4 py-3 shrink-0 border-b border-border">
          {/* Breadcrumb */}
          <div className={cn("flex items-center gap-1.5 text-xs min-w-0 flex-1", textMuted)}>
            <FileCode2 className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">snippets</span>
            <ChevronRight className="h-3 w-3 shrink-0 hidden sm:block opacity-50" />
            <span className={cn("truncate font-semibold", textPrimary)}>{snippet.title}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 shrink-0">
            <TitleBtn icon={Copy} label="Duplicate" onClick={onDuplicate} />
            <TitleBtn icon={Edit} label="Edit" onClick={onEdit} />
            <TitleBtn icon={Trash2} label="Delete" onClick={onDelete} danger />
            <div className="w-px h-4 mx-1.5 bg-border" />
            <button
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="flex items-center justify-center h-7 w-7 rounded-lg text-muted-foreground transition-all duration-150 hover:bg-accent hover:text-foreground border border-transparent hover:border-border"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="flex items-end shrink-0 border-b border-border px-3 overflow-x-auto">
          {/* Active tab */}
          <div className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg -mb-px border-t border-l border-r border-border bg-card text-foreground shrink-0">
            <FileCode2 className="h-3.5 w-3.5 shrink-0 text-chart-2" />
            <span className="truncate max-w-[140px] sm:max-w-[220px]">
              {snippet.title.toLowerCase().replace(/\s+/g, "-")}.{getExt(snippet.language)}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 bg-surface-2 text-muted-foreground">
              {lang}
            </span>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* Code */}
          <div className="flex-1 overflow-auto min-w-0 flex flex-col">
            {snippet.description && (
              <div className="px-5 py-2.5 border-b border-border text-xs text-muted-foreground">
                <span className="mr-2 opacity-40">{"//"}</span>
                {snippet.description}
              </div>
            )}
            <div className="flex-1 [&_.cm-editor]:!rounded-none [&>div]:border-none [&>div]:rounded-none">
              <CodeEditor
                value={snippet.code}
                onChange={() => {}}
                language={snippet.language}
                readOnly
                minHeight="380px"
                noBorder
              />
            </div>
          </div>

          {/* ── Right panel (desktop only) ── */}
          <div className="w-56 shrink-0 border-l border-border overflow-y-auto hidden lg:flex flex-col">
            <div className="px-4 py-3 border-b border-border">
              <p className={cn("text-[10px] font-bold uppercase tracking-[0.15em]", textMuted)}>Details</p>
            </div>

            <div className="p-4 space-y-5">
              {/* Visibility */}
              <Detail label="Visibility" icon={snippet.visibility === "public" ? Eye : EyeOff} textMuted={textMuted}>
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
                  snippet.visibility === "public"
                    ? "bg-success/10 text-success"
                    : "bg-muted text-muted-foreground"
                )}>
                  {snippet.visibility === "public"
                    ? <><Eye className="h-3 w-3" />Public</>
                    : <><EyeOff className="h-3 w-3" />Private</>
                  }
                </span>
              </Detail>

              {snippet.category && (
                <Detail label="Category" icon={Folder} textMuted={textMuted}>
                  <span className={cn("text-sm font-medium", textPrimary)}>{snippet.category}</span>
                </Detail>
              )}

              <Detail label="Language" icon={FileCode2} textMuted={textMuted}>
                <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-chart-2/10 text-chart-2">
                  {lang}
                </span>
              </Detail>

              {/* Stats grid */}
              <div className="border-t border-border pt-4">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Lines", value: snippet.code.split("\n").length },
                    { label: "Chars", value: snippet.code.length },
                    { label: "Versions", value: snippet.versions.length },
                    { label: "Tags", value: snippet.tags.length },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl px-3 py-2.5 text-center border border-border bg-surface-2">
                      <p className={cn("text-base font-bold tabular-nums", textPrimary)}>{value}</p>
                      <p className={cn("text-[10px] mt-0.5 uppercase tracking-wider", textMuted)}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="border-t border-border pt-4 space-y-3">
                <Detail label="Created" icon={Calendar} textMuted={textMuted}>
                  <span className={cn("text-xs", textSub)}>
                    {new Date(snippet.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </Detail>
                <Detail label="Updated" icon={Clock} textMuted={textMuted}>
                  <span className={cn("text-xs", textSub)}>
                    {new Date(snippet.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </Detail>
              </div>

              {/* Tags */}
              {snippet.tags.length > 0 && (
                <div className="border-t border-border pt-4 space-y-2.5">
                  <div className={cn("flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em]", textMuted)}>
                    <Tag className="h-3 w-3" />Tags
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {snippet.tags.map((tag) => (
                      <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full font-medium border border-border bg-surface-2 text-muted-foreground">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Mobile meta strip ── */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-t border-border overflow-x-auto shrink-0 lg:hidden">
          <span className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold shrink-0",
            snippet.visibility === "public"
              ? "bg-success/10 text-success"
              : "bg-muted text-muted-foreground"
          )}>
            {snippet.visibility === "public" ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            {snippet.visibility}
          </span>
          {snippet.category && (
            <span className={cn("text-[11px] shrink-0 flex items-center gap-1", textMuted)}>
              <Folder className="h-3 w-3" />{snippet.category}
            </span>
          )}
          <span className={cn("text-[11px] shrink-0", textMuted)}>{snippet.code.split("\n").length} lines</span>
          {snippet.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[11px] px-2 py-0.5 rounded-full border border-border bg-surface-2 text-muted-foreground shrink-0">#{tag}</span>
          ))}
        </div>

        {/* ── Status bar ── */}
        <div className="flex items-center justify-between px-5 py-1.5 shrink-0 border-t border-border text-[11px] text-foreground/70">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-chart-2">{lang}</span>
            <span>{snippet.code.split("\n").length} lines</span>
            <span className="hidden sm:inline">{snippet.code.length} chars</span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <span>UTF-8</span>
            <span>LF</span>
            <span className={cn(
              "font-medium",
              snippet.visibility === "public" ? "text-success" : ""
            )}>
              {snippet.visibility}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function TitleBtn({
  icon: Icon, label, onClick, danger,
}: {
  icon: React.ElementType; label: string; onClick: () => void; danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 focus:outline-none",
        danger
          ? "text-destructive/70 hover:text-destructive hover:bg-destructive/10"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

function Detail({
  label, icon: Icon, textMuted, children,
}: {
  label: string; icon: React.ElementType; textMuted: string; children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className={cn("flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em]", textMuted)}>
        <Icon className="h-3 w-3" />{label}
      </div>
      <div>{children}</div>
    </div>
  )
}

function getExt(lang: string): string {
  const map: Record<string, string> = {
    javascript: "js", typescript: "ts", python: "py", rust: "rs",
    go: "go", java: "java", cpp: "cpp", c: "c", css: "css",
    html: "html", json: "json", markdown: "md", sql: "sql",
    shell: "sh", yaml: "yaml", toml: "toml", php: "php",
    ruby: "rb", swift: "swift", kotlin: "kt", scala: "scala",
    dart: "dart", lua: "lua", r: "r", perl: "pl",
  }
  return map[lang] ?? "txt"
}
