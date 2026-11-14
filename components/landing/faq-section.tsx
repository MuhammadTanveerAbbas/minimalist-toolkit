"use client"

import { useState } from "react"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const FAQ = [
  {
    q: "Do I need a separate account for each tool?",
    a: "No. One sign-in gives you all tools. Your snippets, chat history, and generation history are all attached to the same account, so you can move between them without logging in again.",
  },
  {
    q: "Which tools work without an AI key?",
    a: "Snippet Manager, the dashboard, and chat history work with no external service configured. PromptCraft and the chat workspace need a model API key on the server, and show a clear configuration message if one is missing.",
  },
  {
    q: "Where is my data stored?",
    a: "Saved documents live in your own database, protected by row-level security policies that bind each row to your user id. Generation history for Mockify and PromptCraft also persists to your account when the database is reachable, and falls back to this browser when it is not, so the tools never appear broken.",
  },
  {
    q: "Can I get my data out?",
    a: "Yes. Snippets export to JSON or a Gist payload. Nothing is locked in.",
  },
  {
    q: "Is there a paid tier?",
    a: "There is no billing system wired up yet, so everything is available to every account. Nothing is trial-limited and no card is requested at sign-up.",
  },
  {
    q: "Does it work on a phone?",
    a: "Every page is built mobile first. The workspace switches to a bottom tab bar on small screens, filters open in a sheet, data tables become stacked cards, and the code editor and document views adapt to the viewport.",
  },
  {
    q: "Can I use it with my team?",
    a: "Right now each account is private to one person. There is no shared workspace or seat management yet, and the interface does not pretend otherwise.",
  },
]

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="scroll-mt-16 border-b border-border">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">Questions</p>
            <h2 className="mt-3 text-balance-tight text-3xl font-semibold tracking-tight sm:text-4xl">
              The things worth asking
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Including the ones where the honest answer is that a feature does not exist yet.
            </p>
          </div>

          <ul className="divide-y divide-border border-y border-border">
            {FAQ.map((item, index) => {
              const isOpen = open === index
              return (
                <li key={item.q}>
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      className="flex w-full items-start justify-between gap-4 py-4 text-left transition-colors hover:text-brand sm:py-5"
                    >
                      <span className="text-sm font-medium sm:text-base">{item.q}</span>
                      <span
                        className={cn(
                          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border transition-colors",
                          isOpen && "border-foreground bg-foreground text-background"
                        )}
                        aria-hidden="true"
                      >
                        {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                      </span>
                    </button>
                  </h3>
                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-300",
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-2xl pb-5 pr-10 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
