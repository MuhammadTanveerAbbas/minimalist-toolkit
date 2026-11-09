import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist_Mono } from "next/font/google"
import { ThemeInit } from "@/components/theme-init"
import "./globals.css"

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
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
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
    apple: ["/icon.svg"],
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
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistMono.variable} font-mono antialiased`}>
        <ThemeInit />
        {children}
      </body>
    </html>
  )
}
