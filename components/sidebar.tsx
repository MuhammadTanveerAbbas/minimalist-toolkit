"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ChevronDown, Tag, Folder, LayoutGrid, Eye, EyeOff, Menu, Code2, SlidersHorizontal, X } from "lucide-react"
import type { Language, SnippetFilters } from "@/lib/types"
import { LANGUAGE_NAMES } from "@/lib/editor-languages"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface SnippetCounts {
  total: number
  public: number
  private: number
  byLanguage: Record<string, number>
  byCategory: Record<string, number>
  byTag: Record<string, number>
}

interface SidebarProps {
  allTags: string[]
  allCategories: string[]
  filters: SnippetFilters
  onFiltersChange: (filters: SnippetFilters) => void
  snippetCounts: SnippetCounts
}

function NavItem({
  icon: Icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: React.ElementType
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-all duration-150",
        active
          ? "bg-foreground font-medium text-background shadow-sm"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      <span className="flex items-center gap-2.5">
        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate">{label}</span>
      </span>
      <span
        className={cn(
          "shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums",
          active ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"
        )}
      >
        {count}
      </span>
    </button>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-3 pb-1.5 pt-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{children}</p>
      <div className="h-px flex-1 bg-border/60" aria-hidden="true" />
    </div>
  )
}

function FilterChip({
  label,
  count,
  active,
  dot,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  dot?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "group flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs transition-all duration-150",
        active
          ? "bg-secondary font-medium text-secondary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      <span className="flex items-center gap-2 truncate">
        {dot ? (
          <span
            className={cn(
              "h-1.5 w-1.5 shrink-0 rounded-full transition-colors",
              active ? "bg-foreground" : "bg-muted-foreground/40"
            )}
            aria-hidden="true"
          />
        ) : null}
        <span className="truncate">{label}</span>
      </span>
      <span
        className={cn(
          "ml-2 shrink-0 text-[11px] tabular-nums",
          active ? "text-secondary-foreground" : "text-muted-foreground/60"
        )}
      >
        {count}
      </span>
    </button>
  )
}

function SidebarInner({ allTags, allCategories, filters, onFiltersChange, snippetCounts }: SidebarProps) {
  const [languagesOpen, setLanguagesOpen] = useState(true)
  const [categoriesOpen, setCategoriesOpen] = useState(true)
  const [tagsOpen, setTagsOpen] = useState(true)

  const topLanguages = Object.entries(snippetCounts.byLanguage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  const hasActiveFilter =
    !!filters.language || !!filters.category || (filters.tags && filters.tags.length > 0) || !!filters.visibility

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Filters</p>
        </div>
        {hasActiveFilter ? (
          <button
            type="button"
            onClick={() => onFiltersChange({ search: filters.search })}
            className="rounded px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Clear
          </button>
        ) : null}
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-0.5 px-2 py-2">
          <SectionLabel>View</SectionLabel>
          <NavItem
            icon={LayoutGrid}
            label="All snippets"
            count={snippetCounts.total}
            active={!filters.visibility}
            onClick={() => onFiltersChange({ ...filters, visibility: undefined })}
          />
          <NavItem
            icon={Eye}
            label="Public"
            count={snippetCounts.public}
            active={filters.visibility === "public"}
            onClick={() => onFiltersChange({ ...filters, visibility: "public" })}
          />
          <NavItem
            icon={EyeOff}
            label="Private"
            count={snippetCounts.private}
            active={filters.visibility === "private"}
            onClick={() => onFiltersChange({ ...filters, visibility: "private" })}
          />

          {topLanguages.length > 0 ? (
            <>
              <SectionLabel>Languages</SectionLabel>
              <Collapsible open={languagesOpen} onOpenChange={setLanguagesOpen}>
                <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                  <span className="flex items-center gap-2">
                    <Code2 className="h-3 w-3" aria-hidden="true" />
                    <span className="font-medium">{topLanguages.length} languages</span>
                  </span>
                  <ChevronDown
                    className={cn("h-3 w-3 transition-transform duration-200", !languagesOpen && "-rotate-90")}
                    aria-hidden="true"
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-0.5 space-y-0.5">
                  {topLanguages.map(([lang, count]) => (
                    <FilterChip
                      key={lang}
                      label={LANGUAGE_NAMES[lang as Language] ?? lang}
                      count={count}
                      active={filters.language === lang}
                      dot
                      onClick={() =>
                        onFiltersChange({
                          ...filters,
                          language: filters.language === lang ? undefined : (lang as Language),
                        })
                      }
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </>
          ) : null}

          {allCategories.length > 0 ? (
            <>
              <SectionLabel>Categories</SectionLabel>
              <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                  <span className="flex items-center gap-2">
                    <Folder className="h-3 w-3" aria-hidden="true" />
                    <span className="font-medium">{allCategories.length} categories</span>
                  </span>
                  <ChevronDown
                    className={cn("h-3 w-3 transition-transform duration-200", !categoriesOpen && "-rotate-90")}
                    aria-hidden="true"
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-0.5 space-y-0.5">
                  {allCategories.map((category) => (
                    <FilterChip
                      key={category}
                      label={category}
                      count={snippetCounts.byCategory[category] ?? 0}
                      active={filters.category === category}
                      onClick={() =>
                        onFiltersChange({
                          ...filters,
                          category: filters.category === category ? undefined : category,
                        })
                      }
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </>
          ) : null}

          {allTags.length > 0 ? (
            <>
              <SectionLabel>Tags</SectionLabel>
              <Collapsible open={tagsOpen} onOpenChange={setTagsOpen}>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                  <span className="flex items-center gap-2">
                    <Tag className="h-3 w-3" aria-hidden="true" />
                    <span className="font-medium">{allTags.length} tags</span>
                  </span>
                  <ChevronDown
                    className={cn("h-3 w-3 transition-transform duration-200", !tagsOpen && "-rotate-90")}
                    aria-hidden="true"
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1.5">
                  <div className="flex flex-wrap gap-1.5 px-2 pb-2">
                    {allTags.slice(0, 24).map((tag) => {
                      const isSelected = filters.tags?.includes(tag)
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            const current = filters.tags ?? []
                            const next = isSelected
                              ? current.filter((t) => t !== tag)
                              : [...current, tag]
                            onFiltersChange({ ...filters, tags: next.length > 0 ? next : undefined })
                          }}
                          aria-pressed={isSelected}
                          className={cn(
                            "inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-medium transition-all duration-150",
                            isSelected
                              ? "border-foreground bg-foreground text-background"
                              : "border-border bg-muted/50 text-muted-foreground hover:border-foreground/30 hover:bg-muted hover:text-foreground"
                          )}
                        >
                          #{tag}
                          <span className={cn("ml-1.5 text-[10px]", isSelected ? "text-background/70" : "text-muted-foreground/60")}>
                            {snippetCounts.byTag[tag] ?? 0}
                          </span>
                        </button>
                      )
                    })}
                    {allTags.length > 24 ? (
                      <span className="px-1 py-1 text-[11px] text-muted-foreground/60">
                        +{allTags.length - 24} more
                      </span>
                    ) : null}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </>
          ) : null}
        </div>
      </ScrollArea>
    </div>
  )
}

export function Sidebar(props: SidebarProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] left-4 z-20 h-11 w-11 rounded-full border border-border bg-card shadow-sm hover:bg-accent md:bottom-5"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Open filters</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex w-72 flex-col p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <SidebarInner {...props} />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-border">
      <SidebarInner {...props} />
    </aside>
  )
}
