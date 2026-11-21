import {
  Anthropic,
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

import { ProviderTile } from "@/components/landing/brand-icons"

const PROVIDERS = [
  { name: "Groq", Icon: Groq, note: "Fast inference" },
  { name: "OpenRouter", Icon: OpenRouter, note: "Model routing" },
  { name: "OpenAI", Icon: OpenAI, note: "Frontier models" },
  { name: "Anthropic", Icon: Anthropic, note: "Claude models" },
  { name: "Gemini", Icon: Gemini, note: "Multimodal" },
  { name: "Hugging Face", Icon: HuggingFace, note: "Open weights" },
  { name: "Mistral", Icon: Mistral, note: "Open models" },
  { name: "DeepSeek", Icon: DeepSeek, note: "Reasoning" },
  { name: "Ollama", Icon: Ollama, note: "Local models" },
  { name: "GitHub", Icon: Github, note: "Code and repos" },
]

export function ProvidersSection() {
  return (
    <section id="providers" className="scroll-mt-16 border-b border-border">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-16">
          <div>
            <p className="font-mono text-[11px] text-muted-foreground">01 / Providers</p>
            <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
              Model choice stays with you
            </h2>
            <p className="mt-4 max-w-md text-pretty text-sm leading-6 text-muted-foreground">
              The Playground lists models from the providers you connect. Keys stay on the server and never
              reach the browser. Add an open-weight provider or keep using the one you already pay for.
            </p>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              The news feed reads open APIs from Hacker News, arXiv, GitHub and Hugging Face. No paid data
              source is required.
            </p>
          </div>

          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {PROVIDERS.map(({ name, Icon, note }) => (
              <li
                key={name}
                className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-2 py-4 text-center"
              >
                <ProviderTile name={name} Icon={Icon} size={48} />
                <span className="text-xs font-medium">{name}</span>
                <span className="hidden text-[11px] text-muted-foreground sm:block">{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
