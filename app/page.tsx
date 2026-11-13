import type { Metadata } from "next"
import { SiteNav } from "@/components/landing/site-nav"
import { Hero } from "@/components/landing/hero"
import { BentoGrid } from "@/components/landing/bento-grid"
import { WorkflowShowcase } from "@/components/landing/workflow-showcase"
import { UseCases } from "@/components/landing/use-cases"
import { FaqSection } from "@/components/landing/faq-section"
import { FinalCta } from "@/components/landing/final-cta"
import { SiteFooter } from "@/components/landing/site-footer"

export const metadata: Metadata = {
  title: "Minimalist Toolkit - Six focused tools for code, visuals, prompts and client work",
  description:
    "Save and organise code snippets, generate mockups, write better prompts, quote clients, score your roadmap, and ask for help. One account, six tools, your data stays yours.",
  alternates: { canonical: "/" },
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
      "Minimalist Toolkit brings a snippet manager, mockup generator, prompt builder, client quote builder, feature prioritiser and AI chat into one workspace.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Snippet Manager with search, tags and version history",
      "Mockify for prompt-based visuals",
      "PromptCraft for model-specific prompt writing",
      "Quotes for client scopes, deposits and invoices",
      "Prioritizer for weighted feature scoring and rank fragility",
      "AI Chat for short answers in context",
    ],
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:text-background"
        >
          Skip to content
        </a>

        <SiteNav />

        <main id="main" className="reveal-sections">
          <Hero />
          <BentoGrid />
          <WorkflowShowcase />
          <UseCases />
          <FaqSection />
          <FinalCta />
        </main>

        <SiteFooter />
      </div>
  )
}
