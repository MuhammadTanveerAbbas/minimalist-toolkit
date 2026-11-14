import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  Code2,
  ListChecks,
  MessageSquareText,
  Settings,
  Sparkles,
} from "lucide-react"

export interface ToolDefinition {
  /** Stable identifier used for storage keys and document tags. */
  id: string
  name: string
  href: string
  icon: LucideIcon
  /** One line, used on the landing page and in navigation. */
  tagline: string
  /** Two or three sentences, used on the landing page and tool pages. */
  description: string
  /** Short bullet list of real capabilities. */
  highlights: string[]
  /** Accent colour token used for the tool's visual identity. */
  accent: string
}

export const TOOLS: ToolDefinition[] = [
  {
    id: "snippets",
    name: "Snippet Manager",
    href: "/app/snippets",
    icon: Code2,
    tagline: "Your private code library",
    description:
      "Save, search, and organise reusable code with tags, categories, language filtering, version history, and one-click export.",
    highlights: [
      "Full-text and regex search across code",
      "Tags, categories, and language filters",
      "Version history with restore",
      "JSON and Gist export",
    ],
    accent: "var(--chart-2)",
  },
  {
    id: "promptcraft",
    name: "PromptCraft",
    href: "/app/promptcraft",
    icon: Sparkles,
    tagline: "Prompts built for a specific model",
    description:
      "Draft a prompt for the model you are actually using, refine it, and pull in context from a live URL when you need it.",
    highlights: [
      "Model-specific optimisation",
      "URL scraping into context",
      "Enhance and regenerate",
      "Structured, copyable output",
    ],
    accent: "var(--chart-1)",
  },
  {
    id: "chat",
    name: "AI Chat",
    href: "/app/chat",
    icon: MessageSquareText,
    tagline: "Chat and image generation in one workspace",
    description:
      "Ask for help with code, prompts, or product decisions, stream short answers, and generate mockups without leaving the workspace.",
    highlights: [
      "Streaming responses",
      "Image generation with history",
      "Conversation history per session",
      "Clear error states",
    ],
    accent: "var(--chart-2)",
  },
]

export function getTool(id: string): ToolDefinition | undefined {
  return TOOLS.find((tool) => tool.id === id)
}

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  /** Match the path exactly instead of by prefix. */
  exact?: boolean
}

export interface NavCategory {
  id: string
  label: string
  items: NavItem[]
}

/**
 * The workspace sidebar is organised into functional categories so a new
 * tool has an obvious home instead of joining one long flat list.
 */
export const NAV_CATEGORIES: NavCategory[] = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { href: "/app/dashboard", label: "Dashboard", icon: BarChart3, exact: true },
      { href: "/app/categories", label: "Categories", icon: ListChecks },
    ],
  },
  {
    id: "create",
    label: "Create",
    items: [
      { href: "/app/snippets", label: "Snippets", icon: Code2 },
      { href: "/app/promptcraft", label: "PromptCraft", icon: Sparkles },
    ],
  },
  {
    id: "assist",
    label: "Assist",
    items: [
      { href: "/app/chat", label: "AI Chat", icon: MessageSquareText },
    ],
  },
]

/** Every workspace destination, in category order. */
export const NAV_ITEMS: NavItem[] = NAV_CATEGORIES.flatMap((category) => category.items)

/**
 * The four destinations that get their own slot in the mobile bottom bar.
 * Everything else is reachable from the "More" sheet.
 */
export const MOBILE_BAR_ITEMS: NavItem[] = [
  { href: "/app/dashboard", label: "Home", icon: BarChart3, exact: true },
  { href: "/app/snippets", label: "Snippets", icon: Code2 },
  { href: "/app/chat", label: "Chat", icon: MessageSquareText },
]

export const SETTINGS_NAV_ITEM: NavItem = { href: "/app/settings", label: "Settings", icon: Settings }
