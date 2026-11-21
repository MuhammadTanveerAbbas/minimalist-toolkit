import Link from "next/link"
import { Gift, Lock, Rocket, ScanEye, Sparkles, Zap } from "lucide-react"
import { HeroBrandIcons, ProviderStrip } from "@/components/landing/brand-icons"
import { TOOLS } from "@/lib/navigation"

const PROOF_POINTS = [
  { label: "Free while in preview", icon: Gift },
  { label: "Your data stays yours", icon: Lock },
  { label: "No setup, ship instantly", icon: Rocket },
]

const HEADLINE = [
  { text: "Code snippets,", accent: false },
  { text: "better prompts,", accent: false },
  { text: "AI chat, one", accent: false },
  { text: "workspace.", accent: true },
]

export function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10 grid-lines opacity-[0.12] [mask-image:radial-gradient(120%_90%_at_50%_0%,black,transparent_72%)]"
        aria-hidden="true"
      />
      <HeroBrandIcons />
      <div className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pt-16">
        <div className="pb-10 lg:pb-14">

          {/* Text */}
          <div className="relative z-10 min-w-0 text-center">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <Zap className="h-3 w-3 text-brand" aria-hidden="true" />
              A workspace for people who ship
            </p>

            <h1 className="mt-5 font-display text-[clamp(2.4rem,6.2vw,4rem)] font-normal leading-[0.98] tracking-[-0.035em]">
              {HEADLINE.map((line, index) => (
                <span key={line.text} className="block overflow-hidden">
                  <span
                    className={`animate-rise block pb-[0.08em] ${line.accent ? "text-brand" : ""}`}
                    style={{ animationDelay: `${80 + index * 90}ms` }}
                  >
                    {line.text}
                  </span>
                </span>
              ))}
            </h1>

            <p
              className="animate-fade-up mx-auto mt-5 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8"
              style={{ animationDelay: "460ms" }}
            >
              Save and search your code library, craft prompts for the model you actually use, and chat or generate images, all under one account.
            </p>

            <div
              className="animate-fade-up mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center"
              style={{ animationDelay: "540ms" }}
            >
              <Link
                href="/signup"
                className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                <Sparkles className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
                Create your workspace
              </Link>
              <a
                href="#workflow"
                className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 text-sm font-medium transition-colors hover:bg-accent"
              >
                <ScanEye className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
                See how it works
              </a>
            </div>

            <ul
              className="animate-fade-up mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground"
              style={{ animationDelay: "620ms" }}
            >
              {PROOF_POINTS.map(({ label, icon: Icon }) => (
                <li key={label} className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>

            <div className="mt-6 md:hidden">
              <ProviderStrip compact />
            </div>
          </div>

          {/* Looping tool strip */}
          <div
            className="animate-fade-up marquee relative mt-12 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
            style={{ animationDelay: "720ms" }}
            aria-label="Included tools"
          >
            <div className="marquee-track flex items-center gap-0">
              {[...TOOLS, ...TOOLS, ...TOOLS, ...TOOLS, ...TOOLS, ...TOOLS].map((tool, i) => {
                const Icon = tool.icon
                return (
                  <div key={i} className="flex shrink-0 items-center">
                    <div className="flex items-center gap-2.5 px-6 py-3">
                      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" style={{ color: tool.accent }} aria-hidden="true" />
                      <span className="text-sm font-medium">{tool.name}</span>
                      <span className="text-xs text-muted-foreground">{tool.tagline}</span>
                    </div>
                    <span className="h-1 w-1 shrink-0 rounded-full bg-border" aria-hidden="true" />
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
