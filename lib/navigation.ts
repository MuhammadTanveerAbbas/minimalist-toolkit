import type { LucideIcon } from "lucide-react"
import {
  BarChart3,
  Code2,
  FileText,
  ImageIcon,
  ListChecks,
  MessageSquareText,
  Settings,
  Sparkles,
  Target,
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
    id: "mockify",
    name: "Mockify",
    href: "/app/mockify",
    icon: ImageIcon,
    tagline: "Prompt to product visuals",
    description:
      "Turn a written brief into a mockup or concept image, then keep a searchable history of everything you have generated.",
    highlights: [
      "Aspect ratio and model controls",
      "Generation history in the browser",
      "Download, fullscreen, and copy prompt",
      "Reusable prompt starters",
    ],
    accent: "var(--chart-3)",
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
    id: "quotes",
    name: "Quotes",
    href: "/app/quotes",
    icon: FileText,
    tagline: "Scope, quote, and get paid",
    description:
      "Build a client quote with line items, tax, deposit, and payment terms, then convert it into an invoice without retyping a thing.",
    highlights: [
      "Line items with quantity and rate",
      "Tax, discount, and deposit handling",
      "Net 7/15/30 payment terms",
      "Convert quote to invoice",
    ],
    accent: "var(--chart-4)",
  },
  {
    id: "prioritizer",
    name: "Prioritizer",
    href: "/app/prioritizer",
    icon: Target,
    tagline: "Defend your roadmap order",
    description:
      "Score features with weighted criteria, see how sensitive the ranking is to your assumptions, and export a decision record.",
    highlights: [
      "RICE, ICE, and WSJF scoring",
      "Adjustable criteria weights",
      "Rank fragility analysis",
      "CSV and Markdown export",
    ],
    accent: "var(--chart-5)",
  },
  {
    id: "chat",
    name: "AI Chat",
    href: "/app/chat",
    icon: MessageSquareText,
    tagline: "Short answers, in context",
    description:
      "Ask for help with code, prompts, or product decisions and get a short, plain-language answer without leaving the workspace.",
    highlights: [
      "Streaming responses",
      "Conversation history per session",
      "Short, structured answers",
      "Clear error states",
    ],
    accent: "var(--chart-2)",
  },
]

export function getTool(id: string): ToolDefinition | undefined {
  return TOOLS.find((tool) => tool.id === id)
}

export const NAV_GROUPS: { label: string; items: { href: string; label: string; icon: LucideIcon; exact?: boolean }[] }[] = [
  {
    label: "Workspace",
    items: [
      { href: "/app/dashboard", label: "Dashboard", icon: BarChart3, exact: true },
      { href: "/app/categories", label: "Categories", icon: ListChecks },
      { href: "/app/chat", label: "AI Chat", icon: MessageSquareText },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/app/snippets", label: "Snippets", icon: Code2 },
      { href: "/app/mockify", label: "Mockify", icon: ImageIcon },
      { href: "/app/promptcraft", label: "PromptCraft", icon: Sparkles },
      { href: "/app/quotes", label: "Quotes", icon: FileText },
      { href: "/app/prioritizer", label: "Prioritizer", icon: Target },
    ],
  },
]

export const SETTINGS_NAV_ITEM = { href: "/app/settings", label: "Settings", icon: Settings }
