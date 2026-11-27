import type { Metadata } from "next"
import { siteDescription, siteTitle, siteUrl } from "@/lib/site-metadata"
import { SiteNav } from "@/components/landing/site-nav"
import { Hero } from "@/components/landing/hero"
import { BentoGrid } from "@/components/landing/bento-grid"
import { WorkflowShowcase } from "@/components/landing/workflow-showcase"
import { ProvidersSection } from "@/components/landing/providers-section"
import { SecuritySection } from "@/components/landing/security-section"
import { UseCases } from "@/components/landing/use-cases"
import { FaqSection } from "@/components/landing/faq-section"
import { FinalCta } from "@/components/landing/final-cta"
import { SiteFooter } from "@/components/landing/site-footer"

export const metadata: Metadata = {
  title: { absolute: siteTitle },
  description: siteDescription,
  alternates: { canonical: "/" },
}

export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Minimalist Toolkit",
    url: siteUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description:
      "Minimalist Toolkit brings a snippet manager, prompt builder, mockup generator, and an AI chat workspace into one account.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: [
      "Snippet Manager with search, tags and version history",
      "Mockify for prompt-based visuals",
      "PromptCraft for model-specific prompt writing",
      "AI Chat workspace with image generation",
    ],
  }

  return (
    <div id="top" className="min-h-dvh bg-background text-foreground">
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
          <ProvidersSection />
          <UseCases />
          <SecuritySection />
          <FaqSection />
          <FinalCta />
        </main>

        <SiteFooter />
      </div>
  )
}
