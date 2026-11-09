"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ChevronDown, Tag, Folder, LayoutGrid, Eye, EyeOff, Menu, Code2, SlidersHorizontal } from "lucide-react"
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
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-150 group",
        active
          ? "bg-foreground text-background font-medium shadow-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
      )}
    >
      <span className="flex items-center gap-2.5">
        <Icon className={cn("h-3.5 w-3.5 shrink-0", active ? "text-background" : "")} />
        <span className="truncate">{label}</span>
      </span>
      <span className={cn(
        "text-[11px] tabular-nums px-1.5 py-0.5 rounded-md font-medium shrink-0",
        active
          ? "bg-background/20 text-background"
          : "bg-muted text-muted-foreground group-hover:bg-muted/80"
      )}>
        {count}
      </span>
    </button>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-3 pt-4 pb-1.5">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">{children}</p>
      <div className="flex-1 h-px bg-border/60" />
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
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all duration-150 group",
        active
          ? "bg-secondary text-secondary-foreground font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      <span className="flex items-center gap-2 truncate">
        {dot && (
          <span className={cn(
            "h-1.5 w-1.5 rounded-full shrink-0 transition-colors",
            active ? "bg-foreground" : "bg-muted-foreground/40"
          )} />
        )}
        <span className="truncate">{label}</span>
      </span>
      <span className={cn(
        "tabular-nums shrink-0 ml-2 text-[11px]",
        active ? "text-secondary-foreground" : "text-muted-foreground/60"
      )}>{count}</span>
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

  const hasActiveFilter = !!filters.language || !!filters.category || (filters.tags && filters.tags.length > 0) || !!filters.visibility

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Filters</p>
        </div>
        {hasActiveFilter && (
          <button
            onClick={() => onFiltersChange({ search: filters.search })}
            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-muted/50"
          >
            Clear
          </button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="px-2 py-2 space-y-0.5">
          {/* View section */}
          <SectionLabel>View</SectionLabel>
          <NavItem
            icon={LayoutGrid}
            label="All Snippets"
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

          {topLanguages.length > 0 && (
            <>
              <SectionLabel>Languages</SectionLabel>
              <Collapsible open={languagesOpen} onOpenChange={setLanguagesOpen}>
                <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/40 group">
                  <span className="flex items-center gap-2">
                    <Code2 className="h-3 w-3" />
                    <span className="font-medium">{topLanguages.length} languages</span>
                  </span>
                  <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", !languagesOpen && "-rotate-90")} />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-0.5 mt-0.5">
                  {topLanguages.map(([lang, count]) => (
                    <FilterChip
                      key={lang}
                      label={LANGUAGE_NAMES[lang as Language]}
                      count={count}
                      active={filters.language === lang}
                      dot
                      onClick={() => onFiltersChange({
                        ...filters,
                        language: filters.language === lang ? undefined : (lang as Language),
                      })}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </>
          )}

          {allCategories.length > 0 && (
            <>
              <SectionLabel>Categories</SectionLabel>
              <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
                <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/40">
                  <span className="flex items-center gap-2">
                    <Folder className="h-3 w-3" />
                    <span className="font-medium">{allCategories.length} categories</span>
                  </span>
                  <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", !categoriesOpen && "-rotate-90")} />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-0.5 mt-0.5">
                  {allCategories.map((category) => (
                    <FilterChip
                      key={category}
                      label={category}
                      count={snippetCounts.byCategory[category] ?? 0}
                      active={filters.category === category}
                      onClick={() => onFiltersChange({
                        ...filters,
                        category: filters.category === category ? undefined : category,
                      })}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </>
          )}

          {allTags.length > 0 && (
            <>
              <SectionLabel>Tags</SectionLabel>
              <Collapsible open={tagsOpen} onOpenChange={setTagsOpen}>
                <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/40">
                  <span className="flex items-center gap-2">
                    <Tag className="h-3 w-3" />
                    <span className="font-medium">{allTags.length} tags</span>
                  </span>
                  <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", !tagsOpen && "-rotate-90")} />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-1.5">
                  <div className="flex flex-wrap gap-1.5 px-2 pb-2">
                    {allTags.slice(0, 20).map((tag) => {
                      const isSelected = filters.tags?.includes(tag)
                      return (
                        <button
                          key={tag}
                          onClick={() => {
                            const current = filters.tags ?? []
                            const next = isSelected ? current.filter((t) => t !== tag) : [...current, tag]
                            onFiltersChange({ ...filters, tags: next.length > 0 ? next : undefined })
                          }}
                          className={cn(
                            "inline-flex items-center px-2 py-1 rounded-md text-[11px] font-medium transition-all duration-150 border",
                            isSelected
                              ? "bg-foreground text-background border-foreground"
                              : "bg-muted/50 text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground hover:bg-muted"
                          )}
                        >
                          #{tag}
                          <span className={cn(
                            "ml-1.5 text-[10px]",
                            isSelected ? "text-background/70" : "text-muted-foreground/60"
                          )}>{snippetCounts.byTag[tag] ?? 0}</span>
                        </button>
                      )
                    })}
                    {allTags.length > 20 && (
                      <span className="text-[11px] text-muted-foreground/50 px-1 py-1">+{allTags.length - 20} more</span>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </>
          )}
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
            className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] left-4 z-20 h-11 w-11 rounded-full border border-border bg-background hover:bg-muted md:bottom-5"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open filters</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 flex flex-col">
          <SheetHeader className="sr-only">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <SidebarInner {...props} />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside className="w-56 border-r border-border flex flex-col h-full shrink-0">
      <SidebarInner {...props} />
    </aside>
  )
}
