import type React from "react"
import type { Metadata, Viewport } from "next"
import { BBH_Bogle, Lato, Open_Sans } from "next/font/google"
import { THEME_INIT_SCRIPT } from "@/lib/theme"
import { SmoothScroll } from "@/components/smooth-scroll"
import "./globals.css"

const bbhBogle = BBH_Bogle({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bogle",
  fallback: ["Lato", "sans-serif"],
  // Next has no metric table for this recent font, so skip fallback adjustment.
  adjustFontFallback: false,
})

const lato = Lato({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-lato",
})

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
})


const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://minimalist-toolkit.vercel.app"
const siteName = "Minimalist Toolkit"
const siteDescription =
  "Minimalist Toolkit brings Snippet Manager, Mockify, PromptCraft, and AI chat into one clean workspace."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - Snippets, Mockify, PromptCraft`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "Minimalist Toolkit",
    "snippet manager",
    "code snippets",
    "Mockify",
    "image prompt generator",
    "PromptCraft",
    "prompt engineering",
    "developer tools",
    "AI workspace",
    "Next.js",
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: ["/icon.png"],
    apple: ["/icon.png"],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: `${siteName} - Snippets, Mockify, PromptCraft`,
    description: siteDescription,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} - Snippets, Mockify, PromptCraft`,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "technology",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Applies the stored theme before the first paint so there is no flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className={`${bbhBogle.variable} ${lato.variable} ${openSans.variable} font-sans antialiased`}>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  )
}
