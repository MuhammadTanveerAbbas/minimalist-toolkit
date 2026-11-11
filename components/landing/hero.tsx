import Link from "next/link"
import { ArrowDown, ArrowRight, Check, Command, Sparkles, Target, TrendingUp } from "lucide-react"
import { ProductShowcase } from "@/components/landing/product-showcase"
import { ToolMarquee } from "@/components/landing/marquee"

const PROOF_POINTS = ["Free while in preview", "Your data stays yours", "No card required"]

const HEADLINE = [
  { text: "Six tools that do", accent: false },
  { text: "one job each.", accent: false },
  { text: "Stop paying for", accent: false },
  { text: "seven half-apps.", accent: true },
]

export function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden border-b border-border">
      <div
        className="pointer-events-none absolute inset-0 -z-10 grid-lines opacity-[0.12] [mask-image:radial-gradient(120%_90%_at_45%_0%,black,transparent_72%)]"
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-7xl px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pt-16">
        <div className="grid items-center gap-10 pb-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-12 lg:pb-14">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
              </span>
              A workspace for people who ship
            </p>

            <h1 className="mt-5 text-[clamp(2.35rem,6.2vw,4rem)] font-semibold leading-[0.98] tracking-[-0.035em]">
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
              className="animate-fade-up mt-5 max-w-lg text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8"
              style={{ animationDelay: "460ms" }}
            >
              Your code library, your visuals, your prompts, your client quotes and your roadmap decisions.
              One account, one history, no tab sprawl.
            </p>

            <div
              className="animate-fade-up mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"
              style={{ animationDelay: "540ms" }}
            >
              <Link
                href="/signup"
                className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Create your workspace
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
              <a
                href="#workflow"
                className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-medium transition-colors hover:bg-accent"
              >
                See how it works
                <ArrowDown
                  className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-y-0.5"
                  aria-hidden="true"
                />
              </a>
            </div>

            <ul
              className="animate-fade-up mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground"
              style={{ animationDelay: "620ms" }}
            >
              {PROOF_POINTS.map((point) => (
                <li key={point} className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Art board: layered product frame with floating proof chips */}
          <div className="relative min-w-0 lg:pl-6">
            <div
              className="pointer-events-none absolute -inset-5 -z-10 hidden grid-lines opacity-25 [mask-image:radial-gradient(80%_80%_at_60%_40%,black,transparent_75%)] sm:block"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 translate-x-2.5 translate-y-2.5 rounded-2xl border border-border bg-brand-soft sm:translate-x-4 sm:translate-y-4"
              aria-hidden="true"
            />

            <div className="animate-scale-in relative" style={{ animationDelay: "220ms" }}>
              <ProductShowcase />
            </div>

            <div className="pointer-events-none absolute -left-3 -top-5 hidden animate-float items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2 shadow-lg sm:flex">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background">
                <Command className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Command palette
                </span>
                <span className="block font-mono text-[11px] font-medium">⌘ K</span>
              </span>
            </div>

            <div className="pointer-events-none absolute -bottom-6 -right-2 hidden animate-float-slow items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2 shadow-lg sm:flex">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft text-brand-contrast">
                <Target className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Roadmap score
                </span>
                <span className="block text-[11px] font-semibold tabular-nums">82 / 100</span>
              </span>
            </div>

            <div
              className="pointer-events-none absolute -right-3 top-16 hidden animate-float items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2 shadow-lg xl:flex"
              style={{ animationDelay: "1.2s" }}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 text-chart-5">
                <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Reuse
                </span>
                <span className="block text-[11px] font-semibold tabular-nums">+38%</span>
              </span>
            </div>

            <div
              className="pointer-events-none absolute -left-4 bottom-14 hidden animate-float-slow items-center gap-2.5 rounded-xl border border-border bg-card px-3 py-2 shadow-lg xl:flex"
              style={{ animationDelay: "2s" }}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 text-chart-3">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="text-[11px] font-medium">Prompt ready</span>
            </div>
          </div>
        </div>
      </div>

      <ToolMarquee />
    </section>
  )
}
