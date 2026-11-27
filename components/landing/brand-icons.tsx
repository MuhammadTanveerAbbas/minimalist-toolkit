import type { ComponentType } from "react"
import {
  DeepSeek,
  Gemini,
  Github,
  Groq,
  HuggingFace,
  Mistral,
  Ollama,
  OpenRouter,
  OpenAI,
} from "@lobehub/icons"

import { cn } from "@/lib/utils"

type BrandIcon = ComponentType<{
  size?: string | number
  className?: string
  "aria-hidden"?: boolean
}>

interface Provider {
  name: string
  Icon: BrandIcon
}

const PROVIDERS: Provider[] = [
  { name: "Groq", Icon: Groq },
  { name: "OpenRouter", Icon: OpenRouter },
  { name: "OpenAI", Icon: OpenAI },
  { name: "Gemini", Icon: Gemini },
  { name: "Hugging Face", Icon: HuggingFace },
  { name: "Mistral", Icon: Mistral },
  { name: "DeepSeek", Icon: DeepSeek },
  { name: "Ollama", Icon: Ollama },
  { name: "GitHub", Icon: Github },
]

export function ProviderTile({
  name,
  Icon,
  size = 56,
  className,
}: {
  name: string
  Icon: BrandIcon
  size?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl border border-border bg-card shadow-sm",
        className
      )}
      style={{ width: size, height: size }}
      title={name}
      aria-label={name}
      role="img"
    >
      <Icon size={Math.round(size * 0.44)} aria-hidden={true} />
    </div>
  )
}

/** Six provider icons arranged in an ellipse around the hero headline. */
export function HeroBrandIcons() {
  const items = [
    { name: "Groq",         Icon: Groq,        angle: 210, delay: "0s",   slow: false },
    { name: "OpenRouter",   Icon: OpenRouter,  angle: 180, delay: "1.5s", slow: true  },
    { name: "Mistral",      Icon: Mistral,     angle: 150, delay: "3s",   slow: false },
    { name: "Gemini",       Icon: Gemini,      angle: 330, delay: "0.8s", slow: true  },
    { name: "OpenAI",       Icon: OpenAI,      angle: 0,   delay: "2.2s", slow: false },
    { name: "Hugging Face", Icon: HuggingFace, angle: 30,  delay: "4s",   slow: true  },
  ]

  // Wider ellipse keeps the icon columns outside the headline on every breakpoint.
  const configs = {
    md: { rx: 600, ry: 140, size: 36, cx: 50, cy: 38 },
    lg: { rx: 520, ry: 200, size: 48, cx: 50, cy: 35 },
  }

  return (
    <>
      {(["md", "lg"] as const).map((bp) => {
        const { rx, ry, size, cx, cy } = configs[bp]
        const half = size / 2
        return (
          <div
            key={bp}
            className={cn(
              "pointer-events-none absolute inset-0",
              bp === "md" ? "hidden md:block lg:hidden" : "hidden lg:block"
            )}
            aria-hidden={true}
          >
            {items.map(({ name, Icon, angle, delay, slow }) => {
              const rad = (angle * Math.PI) / 180
              const x = cx + (rx / 16) * Math.cos(rad)
              const y = cy + (ry / 6)  * Math.sin(rad)
              return (
                <div
                  key={name}
                  className={`absolute ${slow ? "animate-float-slow" : "animate-float"}`}
                  style={{ left: `calc(${x}% - ${half}px)`, top: `calc(${y}% - ${half}px)`, animationDelay: delay }}
                >
                  <ProviderTile name={name} Icon={Icon} size={size} className="rounded-full" />
                </div>
              )
            })}
          </div>
        )
      })}
    </>
  )
}

/** A quiet row of the same marks, used outside the hero and on small screens. */
export function ProviderStrip({ compact = false }: { compact?: boolean }) {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-3">
      {PROVIDERS.map(({ name, Icon }) => (
        <li key={name} className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
          <Icon size={18} aria-hidden={true} />
          <span className={cn("text-xs font-medium", compact && "hidden sm:inline")}>{name}</span>
        </li>
      ))}
    </ul>
  )
}
