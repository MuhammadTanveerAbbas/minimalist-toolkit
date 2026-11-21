import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  Code2,
  FlaskConical,
  FolderOpen,
  ImageIcon,
  LayoutGrid,
  MessageSquareText,
  Newspaper,
  PenLine,
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
  {
    id: "playground",
    name: "AI Playground",
    href: "/app/playground",
    icon: FlaskConical,
    tagline: "Compare two models side by side",
    description:
      "Pick a provider and model for each side, send two prompts, and compare the answers, latency, tokens, and cost in one view.",
    highlights: [
      "Live model list from each provider",
      "Two prompts, two models",
      "Latency, token, and cost comparison",
      "Saved runs for later",
    ],
    accent: "var(--chart-3)",
  },
  {
    id: "news",
    name: "AI News",
    href: "/app/news",
    icon: Newspaper,
    tagline: "A daily open-source AI digest",
    description:
      "One page for new AI stories, research papers, open-source repositories, and newly released models, refreshed once a day.",
    highlights: [
      "Hacker News and arXiv",
      "GitHub and Hugging Face",
      "Grouped by day",
      "No account feeds, no tracking",
    ],
    accent: "var(--chart-5)",
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
}

export interface NavGroup {
  label: string
  icon: LucideIcon
  items: NavItem[]
}

/**
 * The sidebar destinations, split into four labelled categories. The order
 * also decides which way a page slides when someone moves between them.
 */
export const SIDEBAR_GROUPS: NavGroup[] = [
  {
    label: "Workspace",
    icon: LayoutGrid,
    items: [
      { href: "/app/dashboard", label: "Analytics", icon: BarChart3, exact: true },
      { href: "/app/chat", label: "AI Chat", icon: MessageSquareText },
    ],
  },
  {
    label: "Create",
    icon: PenLine,
    items: [
      { href: "/app/snippets", label: "Snippets", icon: Code2 },
      { href: "/app/promptcraft", label: "PromptCraft", icon: Sparkles },
      { href: "/app/mockify", label: "Mockify", icon: ImageIcon },
    ],
  },
  {
    label: "AI Lab",
    icon: FlaskConical,
    items: [
      { href: "/app/playground", label: "Playground", icon: FlaskConical },
      { href: "/app/news", label: "AI News", icon: Newspaper },
    ],
  },
  {
    label: "Library",
    icon: FolderOpen,
    items: [{ href: "/app/categories", label: "Vault", icon: FolderOpen }],
  },
]

export const SETTINGS_NAV_ITEM: NavItem = {
  href: "/app/settings",
  label: "Settings",
  icon: Settings,
}

/** Flat order used for page transition direction. */
export const NAV_ORDER: string[] = [
  ...SIDEBAR_GROUPS.flatMap((group) => group.items.map((item) => item.href)),
  SETTINGS_NAV_ITEM.href,
]
