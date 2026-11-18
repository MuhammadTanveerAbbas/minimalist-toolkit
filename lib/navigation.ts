import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  Code2,
  ImageIcon,
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
  exact?: boolean
  accent?: string
}

/**
 * The five destinations in the pill bar, in left-to-right order. The order
 * also decides which way a page slides when someone moves between them.
 */
export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { href: "/app/dashboard", label: "Analytics", icon: BarChart3, exact: true, accent: "var(--chart-4)" },
  { href: "/app/chat", label: "Chat", icon: MessageSquareText, accent: "var(--chart-2)" },
  { href: "/app/snippets", label: "Snippets", icon: Code2, accent: "var(--chart-2)" },
  { href: "/app/mockify", label: "Mockify", icon: ImageIcon, accent: "var(--chart-3)" },
  { href: "/app/settings", label: "Settings", icon: Settings, accent: "var(--muted-foreground)" },
]
