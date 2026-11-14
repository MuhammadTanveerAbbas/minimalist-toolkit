import Link from "next/link"
import { Command, Gift, Lock, Rocket, ScanEye, Sparkles, TrendingUp, Zap } from "lucide-react"
import { ProductShowcase } from "@/components/landing/product-showcase"
import { ToolMarquee } from "@/components/landing/marquee"

const PROOF_POINTS = [
  { label: "Free while in preview", icon: Gift },
  { label: "Your data stays yours", icon: Lock },
  { label: "No setup, ship instantly", icon: Rocket },
]

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

          {/* Text */}
          <div className="min-w-0 text-center lg:text-left">
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <Zap className="h-3 w-3 text-brand" aria-hidden="true" />
              A workspace for people who ship
            </p>

            <h1 className="mt-5 text-[clamp(2.4rem,6.2vw,4rem)] font-semibold leading-[0.98] tracking-[-0.035em]">
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
              className="animate-fade-up mt-5 text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8 lg:max-w-lg"
              style={{ animationDelay: "460ms" }}
            >
              Your code library, your visuals, your prompts, and your AI workspace.
              One account, one history, no tab sprawl.
            </p>

            <div
              className="animate-fade-up mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start"
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
              className="animate-fade-up mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground lg:justify-start"
              style={{ animationDelay: "620ms" }}
            >
              {PROOF_POINTS.map(({ label, icon: Icon }) => (
                <li key={label} className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          {/* Art board visible from lg up */}
          <div className="relative hidden min-w-0 lg:block lg:pl-4">
            <div
              className="pointer-events-none absolute -inset-5 -z-10 grid-lines opacity-25 [mask-image:radial-gradient(80%_80%_at_60%_40%,black,transparent_75%)]"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 translate-x-4 translate-y-4 rounded-2xl border border-border bg-brand-soft"
              aria-hidden="true"
            />

            <div className="animate-scale-in relative" style={{ animationDelay: "220ms" }}>
              <ProductShowcase />
            </div>

            {/* Badge bottom-left, clamped so it never overflows */}
            <div className="pointer-events-none absolute -left-32 bottom-6 flex animate-float items-center gap-3 rounded-2xl border border-border bg-card/90 px-4 py-2.5 shadow-xl backdrop-blur-sm xl:-left-36">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-foreground text-background shadow-sm">
                <Command className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Quick actions</span>
                <span className="block font-mono text-xs font-semibold">Press ⌘ K</span>
              </span>
            </div>

            {/* Badge top-right */}
            <div
              className="pointer-events-none absolute -right-32 top-2 flex animate-float items-center gap-3 rounded-2xl border border-border bg-card/90 px-4 py-2.5 shadow-xl backdrop-blur-sm xl:-right-36"
              style={{ animationDelay: "1.2s" }}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand shadow-sm">
                <TrendingUp className="h-4 w-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Snippet reuse</span>
                <span className="block text-xs font-bold tabular-nums">+38%</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <ToolMarquee />
    </section>
  )
}
