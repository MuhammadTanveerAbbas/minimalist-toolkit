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
  theme?: "dark" | "light"
}

export function SnippetViewer({
  snippet,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onDuplicate,
  theme = "dark",
}: SnippetViewerProps) {
  if (!snippet) return null

  const lang = LANGUAGE_NAMES[snippet.language]
  const isDark = theme === "dark"

  const bg = isDark ? "bg-black" : "bg-white"
  const border = isDark ? "border-white/8" : "border-black/10"
  const textPrimary = isDark ? "text-white" : "text-gray-900"
  const textMuted = isDark ? "text-white/40" : "text-gray-400"
  const textSub = isDark ? "text-white/60" : "text-gray-500"
  const surfaceHover = isDark ? "hover:bg-white/6" : "hover:bg-black/5"

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
          "flex flex-col border",
          bg, border,
          isDark
            ? "shadow-[0_40px_100px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.06)]"
            : "shadow-2xl"
        )}
      >
        <VisuallyHidden.Root>
          <DialogTitle>{snippet.title}</DialogTitle>
        </VisuallyHidden.Root>

        {/* ── Title bar ── */}
        <div className={cn(
          "flex items-center gap-3 px-4 py-3 shrink-0 border-b",
          isDark ? "border-white/8" : "border-black/8"
        )}>
          {/* Breadcrumb */}
          <div className={cn("flex items-center gap-1.5 text-xs min-w-0 flex-1", textMuted)}>
            <FileCode2 className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">snippets</span>
            <ChevronRight className="h-3 w-3 shrink-0 hidden sm:block opacity-50" />
            <span className={cn("truncate font-semibold", textPrimary)}>{snippet.title}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 shrink-0">
            <TitleBtn icon={Copy} label="Duplicate" onClick={onDuplicate} isDark={isDark} />
            <TitleBtn icon={Edit} label="Edit" onClick={onEdit} isDark={isDark} />
            <TitleBtn icon={Trash2} label="Delete" onClick={onDelete} isDark={isDark} danger />
            <div className={cn("w-px h-4 mx-1.5", isDark ? "bg-white/10" : "bg-black/10")} />
            <button
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className={cn(
                "flex items-center justify-center h-7 w-7 rounded-lg transition-all duration-150",
                "sm:h-7 sm:w-7",
                isDark
                  ? "text-white/30 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10"
                  : "text-gray-400 hover:text-gray-700 hover:bg-black/6 border border-transparent hover:border-black/10"
              )}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className={cn(
          "flex items-end shrink-0 border-b px-3 overflow-x-auto",
          isDark ? "border-white/8" : "border-black/8"
        )}>
          {/* Active tab */}
          <div className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg -mb-px border-t border-l border-r shrink-0",
            isDark
              ? "bg-black border-white/10 text-white"
              : "bg-white border-black/10 text-gray-800"
          )}>
            <FileCode2 className={cn("h-3.5 w-3.5 shrink-0", isDark ? "text-blue-400" : "text-blue-500")} />
            <span className="truncate max-w-[140px] sm:max-w-[220px]">
              {snippet.title.toLowerCase().replace(/\s+/g, "-")}.{getExt(snippet.language)}
            </span>
            <span className={cn(
              "text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0",
              isDark ? "bg-blue-500/15 text-blue-400" : "bg-blue-50 text-blue-600"
            )}>
              {lang}
            </span>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* Code */}
          <div className="flex-1 overflow-auto min-w-0 flex flex-col">
            {snippet.description && (
              <div className={cn(
                "px-5 py-2.5 border-b text-xs",
                isDark ? "border-white/8 text-white/40" : "border-black/8 text-gray-400"
              )}>
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
                theme={theme}
                noBorder
              />
            </div>
          </div>

          {/* ── Right panel (desktop only) ── */}
          <div className={cn(
            "w-56 shrink-0 border-l overflow-y-auto hidden lg:flex flex-col",
            isDark ? "border-white/8" : "border-black/8"
          )}>
            <div className={cn("px-4 py-3 border-b", isDark ? "border-white/8" : "border-black/8")}>
              <p className={cn("text-[10px] font-bold uppercase tracking-[0.15em]", textMuted)}>Details</p>
            </div>

            <div className="p-4 space-y-5">
              {/* Visibility */}
              <Detail label="Visibility" icon={snippet.visibility === "public" ? Eye : EyeOff} textMuted={textMuted}>
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
                  snippet.visibility === "public"
                    ? isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-green-50 text-green-600"
                    : isDark ? "bg-white/6 text-white/40" : "bg-gray-100 text-gray-500"
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
                <span className={cn(
                  "inline-flex px-2.5 py-1 rounded-full text-xs font-semibold",
                  isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
                )}>
                  {lang}
                </span>
              </Detail>

              {/* Stats grid */}
              <div className={cn("border-t pt-4", isDark ? "border-white/8" : "border-black/8")}>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Lines", value: snippet.code.split("\n").length },
                    { label: "Chars", value: snippet.code.length },
                    { label: "Versions", value: snippet.versions.length },
                    { label: "Tags", value: snippet.tags.length },
                  ].map(({ label, value }) => (
                    <div key={label} className={cn(
                      "rounded-xl px-3 py-2.5 text-center border",
                      isDark ? "bg-white/4 border-white/8" : "bg-gray-50 border-black/8"
                    )}>
                      <p className={cn("text-base font-bold tabular-nums", textPrimary)}>{value}</p>
                      <p className={cn("text-[10px] mt-0.5 uppercase tracking-wider", textMuted)}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className={cn("border-t pt-4 space-y-3", isDark ? "border-white/8" : "border-black/8")}>
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
                <div className={cn("border-t pt-4 space-y-2.5", isDark ? "border-white/8" : "border-black/8")}>
                  <div className={cn("flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em]", textMuted)}>
                    <Tag className="h-3 w-3" />Tags
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {snippet.tags.map((tag) => (
                      <span key={tag} className={cn(
                        "text-[11px] px-2 py-0.5 rounded-full font-medium border",
                        isDark ? "bg-white/4 border-white/10 text-white/60" : "bg-gray-100 border-gray-200 text-gray-600"
                      )}>
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
        <div className={cn(
          "flex items-center gap-3 px-4 py-2.5 border-t overflow-x-auto shrink-0 lg:hidden",
          isDark ? "border-white/8" : "border-black/8"
        )}>
          <span className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold shrink-0",
            snippet.visibility === "public"
              ? isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-green-50 text-green-600"
              : isDark ? "bg-white/6 text-white/40" : "bg-gray-100 text-gray-500"
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
            <span key={tag} className={cn(
              "text-[11px] px-2 py-0.5 rounded-full border shrink-0",
              isDark ? "bg-white/4 border-white/10 text-white/50" : "bg-gray-100 border-gray-200 text-gray-500"
            )}>#{tag}</span>
          ))}
        </div>

        {/* ── Status bar ── */}
        <div className={cn(
          "flex items-center justify-between px-5 py-1.5 shrink-0 border-t text-[11px]",
          isDark ? "border-white/8 text-white/60" : "border-black/8 text-gray-900"
        )}>
          <div className="flex items-center gap-3">
            <span className={cn("font-semibold", isDark ? "text-blue-400" : "text-blue-500")}>{lang}</span>
            <span>{snippet.code.split("\n").length} lines</span>
            <span className="hidden sm:inline">{snippet.code.length} chars</span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <span>UTF-8</span>
            <span>LF</span>
            <span className={cn(
              "font-medium",
              snippet.visibility === "public"
                ? isDark ? "text-emerald-400" : "text-green-500"
                : ""
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
  icon: Icon, label, onClick, isDark, danger,
}: {
  icon: React.ElementType; label: string; onClick: () => void; isDark: boolean; danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 focus:outline-none",
        danger
          ? isDark ? "text-red-400/60 hover:text-red-400 hover:bg-red-400/10" : "text-red-400 hover:text-red-600 hover:bg-red-50"
          : isDark ? "text-white/40 hover:text-white hover:bg-white/8" : "text-gray-400 hover:text-gray-700 hover:bg-black/5"
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
