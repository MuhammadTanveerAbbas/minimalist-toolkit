import Link from "next/link"
import {
  ArrowRight,
  Check,
  Code2,
  ImageIcon,
  Sparkles,
  LayoutGrid,
  Search,
  History,
  WandSparkles,
  MessageSquareText,
} from "lucide-react"

const CONTAINER = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"

const tools = [
  {
    name: "Snippet Manager",
    href: "/app/snippets",
    icon: Code2,
    description:
      "Save, search, and organize reusable code with tags, categories, and a focused editing experience.",
    points: ["Search and filters", "Tags and categories", "Fast access to saved code"],
  },
  {
    name: "Mockify",
    href: "/app/mockify",
    icon: ImageIcon,
    description:
      "Turn text prompts into visual mockups and concepts with simple controls for style and output.",
    points: ["Prompt-based generation", "Preview and download", "Recent history"],
  },
  {
    name: "PromptCraft",
    href: "/app/promptcraft",
    icon: Sparkles,
    description:
      "Draft, refine, and improve prompts for different AI platforms with a clean writing workflow.",
    points: ["Platform-aware drafts", "Improve and regenerate", "Optional URL context"],
  },
] as const

function WorkspaceMockup() {
  return (
    <div
      className="animate-fade-up delay-2 overflow-hidden rounded-xl border border-border bg-card"
      role="img"
      aria-label="Workspace preview showing navigation and tool areas"
    >
      <div className="flex items-center gap-2 border-b border-border bg-background px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full border border-border bg-card" />
        <span className="h-2.5 w-2.5 rounded-full border border-border bg-card" />
        <span className="h-2.5 w-2.5 rounded-full border border-border bg-card" />
        <span className="ml-2 min-w-0 truncate rounded border border-border bg-card px-2 py-0.5 text-[10px] text-muted-foreground">
          Workspace
        </span>
      </div>
      <div className="grid min-h-[220px] grid-cols-[88px_minmax(0,1fr)] sm:min-h-[280px] sm:grid-cols-[148px_minmax(0,1fr)]">
        <aside className="border-r border-border bg-card p-2 sm:p-3">
          <div className="space-y-1.5">
            <div className="rounded-md bg-foreground px-2 py-1.5 text-[10px] font-medium text-background sm:text-[11px]">Dashboard</div>
            <div className="rounded-md border border-border bg-background px-2 py-1.5 text-[10px] text-muted-foreground sm:text-[11px]">Snippets</div>
            <div className="rounded-md border border-border bg-background px-2 py-1.5 text-[10px] text-muted-foreground sm:text-[11px]">Mockify</div>
            <div className="rounded-md border border-border bg-background px-2 py-1.5 text-[10px] text-muted-foreground sm:text-[11px]">AI chat</div>
          </div>
        </aside>
        <div className="min-w-0 bg-background p-2 sm:p-3">
          <div className="mb-2 flex items-center justify-between gap-2 border-b border-border pb-2">
            <div className="h-3 w-20 rounded bg-muted sm:w-28" />
            <div className="h-7 w-14 rounded-md border border-border bg-card sm:w-20" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-2">
                <div className="mb-2 h-2.5 w-2/3 rounded bg-muted" />
                <div className="space-y-1">
                  <div className="h-2 w-full rounded bg-muted/70" />
                  <div className="h-2 w-5/6 rounded bg-muted/70" />
                  <div className="h-2 w-4/6 rounded bg-muted/70" />
                </div>
              </div>
            ))}
            <div className="hidden rounded-lg border border-border bg-card p-2 sm:col-span-2 sm:block">
              <div className="mb-2 flex gap-2">
                <div className="h-5 w-14 rounded border border-border bg-background" />
                <div className="h-5 w-14 rounded border border-border bg-background" />
                <div className="h-5 w-14 rounded border border-border bg-background" />
              </div>
              <div className="h-14 rounded border border-border bg-background" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ToolMiniMockup({ tool }: { tool: (typeof tools)[number] }) {
  const Icon = tool.icon
  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-border bg-background" aria-hidden="true">
      <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] font-medium text-muted-foreground">{tool.name}</span>
      </div>
      <div className="p-3">
        {tool.name === "Snippet Manager" ? (
          <div className="space-y-2">
            <div className="h-7 rounded border border-border bg-card" />
            <div className="grid grid-cols-3 gap-2">
              <div className="h-12 rounded border border-border bg-card" />
              <div className="h-12 rounded border border-border bg-card" />
              <div className="h-12 rounded border border-border bg-card" />
            </div>
          </div>
        ) : null}
        {tool.name === "Mockify" ? (
          <div className="grid grid-cols-[minmax(0,1fr)_72px] gap-2 sm:grid-cols-[minmax(0,1fr)_88px]">
            <div className="space-y-2">
              <div className="h-14 rounded border border-border bg-card" />
              <div className="h-7 w-24 max-w-full rounded border border-border bg-card" />
            </div>
            <div className="rounded border border-border bg-card" />
          </div>
        ) : null}
        {tool.name === "PromptCraft" ? (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="h-6 rounded border border-border bg-card" />
              <div className="h-6 rounded border border-border bg-card" />
              <div className="h-6 rounded border border-border bg-card" />
            </div>
            <div className="h-14 rounded border border-border bg-card" />
          </div>
        ) : null}
      </div>
    </div>
  )
}

function ProductFactsInfographic() {
  const facts = [
    { value: "1", label: "Account", detail: "Sign in once and access your workspace." },
    { value: "3", label: "Core tools", detail: "Snippets, Mockify, and PromptCraft." },
    { value: "1", label: "Workspace", detail: "A simple dashboard and grouped navigation." },
  ]
  return (
    <section aria-labelledby="facts-heading" className="w-full border-t border-border">
      <div className={`${CONTAINER} py-14 sm:py-20`}>
        <h2 id="facts-heading" className="animate-fade-up text-2xl font-semibold tracking-tight sm:text-3xl">
          Everything in one place
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Minimalist Toolkit keeps your everyday creative and coding tools together in a clean workspace.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {facts.map((fact, i) => (
            <div
              key={fact.label}
              className={`animate-fade-up rounded-xl border border-border bg-card p-5 ${i === 0 ? "delay-1" : i === 1 ? "delay-2" : "delay-3"}`}
            >
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-semibold tracking-tight">{fact.value}</span>
                <span className="text-sm font-medium">{fact.label}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{fact.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function FlowInfographic() {
  const steps = [
    { icon: LayoutGrid, title: "Sign in", text: "Create an account or log in to open your workspace." },
    { icon: Search, title: "Choose a tool", text: "Pick Snippets, Mockify, PromptCraft, or AI chat." },
    { icon: WandSparkles, title: "Create", text: "Save code, generate visuals, or refine prompts." },
    { icon: History, title: "Return anytime", text: "Come back to your work from the same dashboard." },
  ]
  return (
    <section aria-labelledby="flow-heading" className="w-full border-t border-border bg-card/30">
      <div className={`${CONTAINER} py-14 sm:py-20`}>
        <h2 id="flow-heading" className="animate-fade-up text-2xl font-semibold tracking-tight sm:text-3xl">
          A simple workflow
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Move from idea to saved work without switching between disconnected apps.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.title} className="animate-fade-up rounded-xl border border-border bg-background p-4 transition-colors duration-150 hover:bg-card">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">Step {index + 1}</span>
                </div>
                <h3 className="mt-4 text-sm font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.text}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://minimalist-toolkit.vercel.app"
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Minimalist Toolkit",
    url: siteUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description:
      "Minimalist Toolkit brings Snippet Manager, Mockify, PromptCraft, and AI chat into one clean workspace.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Snippet Manager for reusable code",
      "Mockify for prompt-based visuals",
      "PromptCraft for prompt drafting and refinement",
      "AI chat for quick help",
    ],
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="sticky top-0 z-20 w-full border-b border-border bg-background">
        <div className={`${CONTAINER} flex items-center justify-between gap-3 py-3`}>
          <Link href="/" className="flex min-w-0 items-center gap-2 font-semibold tracking-tight transition-opacity duration-150 hover:opacity-80">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
              <Code2 className="h-4 w-4" />
            </span>
            <span className="truncate">Minimalist Toolkit</span>
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#tools" className="transition-colors duration-150 hover:text-foreground">Tools</a>
            <a href="#workflow" className="transition-colors duration-150 hover:text-foreground">How it works</a>
            <a href="#faq" className="transition-colors duration-150 hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground">
              Log in
            </Link>
            <Link href="/signup" className="inline-flex min-h-11 items-center rounded-lg bg-foreground px-3.5 text-sm font-medium text-background transition-opacity duration-150 hover:opacity-90 sm:px-4">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main id="main" className="w-full">
        <section className="w-full border-b border-border">
          <div className={`${CONTAINER} py-14 sm:py-20 lg:py-24`}>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-12">
              <div className="animate-fade-up min-w-0">
                <p className="inline-flex rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                  One workspace for daily creative work
                </p>
                <h1 className="mt-5 max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                  Build, write, and create in one clean workspace
                </h1>
                <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
                  Minimalist Toolkit brings Snippet Manager, Mockify, PromptCraft, and AI chat together so you can save code, explore ideas, and improve prompts without jumping between tools.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <Link href="/signup" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-foreground px-5 text-sm font-medium text-background transition-opacity duration-150 hover:opacity-90">
                    Create account <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a href="#tools" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-5 text-sm font-medium transition-colors duration-150 hover:bg-muted/40">
                    Explore tools
                  </a>
                </div>
                <ul className="mt-8 grid gap-2 text-sm text-muted-foreground">
                  {[
                    "One account across your workspace",
                    "Separate tools for code, visuals, prompts, and chat",
                    "Clean, responsive design for desktop and mobile",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="min-w-0 lg:pt-2">
                <WorkspaceMockup />
              </div>
            </div>
          </div>
        </section>

        <ProductFactsInfographic />
        <FlowInfographic />

        <section id="tools" className="w-full border-t border-border">
          <div className={`${CONTAINER} py-14 sm:py-20`}>
            <div className="max-w-2xl">
              <h2 className="animate-fade-up text-2xl font-semibold tracking-tight sm:text-3xl">Tools built for focused work</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                Each tool has its own space and purpose, with a consistent experience across the workspace.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-12">
              {tools.map((tool, index) => {
                const Icon = tool.icon
                const span = index === 0 ? "xl:col-span-7" : index === 1 ? "xl:col-span-5" : "xl:col-span-12"
                return (
                  <article
                    key={tool.name}
                    className={`animate-fade-up group min-w-0 rounded-xl border border-border bg-card p-5 transition-colors duration-150 hover:bg-card/80 sm:p-6 ${span} ${index === 1 ? "delay-1" : index === 2 ? "delay-2" : ""}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                          <Icon className="h-4 w-4" />
                        </span>
                        <h3 className="text-base font-semibold sm:text-lg">{tool.name}</h3>
                      </div>
                      <Link href={tool.href} className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground">
                        Open <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                    <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">{tool.description}</p>
                    <ul className={`mt-4 grid gap-2 text-sm text-muted-foreground ${index === 2 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
                      {tool.points.map((point) => (
                        <li key={point} className="flex gap-2">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                    <ToolMiniMockup tool={tool} />
                  </article>
                )
              })}
              <article className="animate-fade-up delay-3 min-w-0 rounded-xl border border-border bg-card p-5 sm:p-6 md:col-span-2 xl:col-span-12">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                      <MessageSquareText className="h-4 w-4" />
                    </span>
                    <h3 className="text-base font-semibold sm:text-lg">AI chat</h3>
                  </div>
                  <Link href="/app/chat" className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground">
                    Open <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
                  Ask for help with code, prompts, and ideas from inside the same workspace.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="workflow" className="w-full border-t border-border bg-card/30">
          <div className={`${CONTAINER} py-14 sm:py-20`}>
            <h2 className="animate-fade-up text-2xl font-semibold tracking-tight sm:text-3xl">How it works</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { icon: LayoutGrid, title: "Create an account", text: "Sign in to access your personal workspace." },
                { icon: Search, title: "Open a tool", text: "Choose the tool that fits what you want to do." },
                { icon: WandSparkles, title: "Do the work", text: "Save snippets, generate images, or refine prompts." },
                { icon: History, title: "Pick up later", text: "Return to your dashboard and continue where you left off." },
              ].map((step, i) => {
                const Icon = step.icon
                return (
                  <div key={step.title} className="animate-fade-up rounded-xl border border-border bg-background p-5">
                    <div className="flex items-center justify-between">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">Step {i + 1}</span>
                    </div>
                    <h3 className="mt-4 font-medium">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section id="faq" className="w-full border-t border-border">
          <div className={`${CONTAINER} py-14 sm:py-20`}>
            <div className="mx-auto max-w-4xl">
              <h2 className="animate-fade-up text-2xl font-semibold tracking-tight sm:text-3xl">FAQ</h2>
              <div className="mt-8 space-y-3">
                {[
                  ["Is this one app?", "Yes. Minimalist Toolkit is one workspace with multiple tools under the same account."],
                  ["Do I need separate accounts for each tool?", "No. One account gives you access to the available tools in the workspace."],
                  ["Can I use it on my phone?", "Yes. The layout is designed to work on small screens, tablets, and desktops."],
                  ["What can I do here?", "You can manage code snippets, create visual mockups from prompts, draft better prompts, and use AI chat for quick help."],
                ].map(([q, a]) => (
                  <details key={q} className="group rounded-xl border border-border bg-card p-4 sm:p-5">
                    <summary className="cursor-pointer list-none pr-2 font-medium marker:content-none">{q}</summary>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{a}</p>
                  </details>
                ))}
              </div>
              <div className="mt-10 rounded-xl border border-border bg-card p-5 sm:p-8">
                <h3 className="text-lg font-semibold sm:text-xl">Ready to start?</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Create an account and open your workspace.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link href="/signup" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-foreground px-5 text-sm font-medium text-background transition-opacity duration-150 hover:opacity-90">
                    Get started
                  </Link>
                  <Link href="/login" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-5 text-sm font-medium transition-colors duration-150 hover:bg-muted/40">
                    Log in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-border bg-card/40">
        <div className={`${CONTAINER} py-12 sm:py-14`}>
          <div className="grid gap-10 border-b border-border pb-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
            <div className="max-w-sm">
              <Link href="/" className="inline-flex items-center gap-2 font-semibold tracking-tight transition-opacity duration-150 hover:opacity-80">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background">
                  <Code2 className="h-4 w-4" />
                </span>
                <span>Minimalist Toolkit</span>
              </Link>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                A clean workspace for snippets, visuals, prompts, and AI chat.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Link href="/signup" className="inline-flex min-h-10 items-center rounded-lg bg-foreground px-3.5 text-sm font-medium text-background transition-opacity duration-150 hover:opacity-90">
                  Get started
                </Link>
                <Link href="/login" className="inline-flex min-h-10 items-center rounded-lg border border-border px-3.5 text-sm font-medium transition-colors duration-150 hover:bg-muted/40">
                  Log in
                </Link>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold">Tools</h2>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="/app/snippets" className="transition-colors duration-150 hover:text-foreground">Snippet Manager</Link></li>
                <li><Link href="/app/mockify" className="transition-colors duration-150 hover:text-foreground">Mockify</Link></li>
                <li><Link href="/app/promptcraft" className="transition-colors duration-150 hover:text-foreground">PromptCraft</Link></li>
                <li><Link href="/app/chat" className="transition-colors duration-150 hover:text-foreground">AI chat</Link></li>
              </ul>
            </div>

            <div>
              <h2 className="text-sm font-semibold">Product</h2>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                <li><a href="#workflow" className="transition-colors duration-150 hover:text-foreground">How it works</a></li>
                <li><a href="#faq" className="transition-colors duration-150 hover:text-foreground">FAQ</a></li>
                <li><Link href="/app" className="transition-colors duration-150 hover:text-foreground">Open workspace</Link></li>
                <li><Link href="/app/settings" className="transition-colors duration-150 hover:text-foreground">Settings</Link></li>
              </ul>
            </div>

            <div>
              <h2 className="text-sm font-semibold">Account</h2>
              <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
                <li><Link href="/login" className="transition-colors duration-150 hover:text-foreground">Log in</Link></li>
                <li><Link href="/signup" className="transition-colors duration-150 hover:text-foreground">Sign up</Link></li>
                <li><Link href="/forgot-password" className="transition-colors duration-150 hover:text-foreground">Account help</Link></li>
                <li><a href="#tools" className="transition-colors duration-150 hover:text-foreground">Explore tools</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>Minimalist Toolkit. A clean workspace for focused work.</p>
            <p>
              Made by{" "}
              <a
                href="https://muhammadtanveerabbas.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-foreground underline-offset-4 transition-colors duration-150 hover:underline"
              >
                Tanveer
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
