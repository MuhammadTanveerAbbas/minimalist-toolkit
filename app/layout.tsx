import type React from "react"
import type { Metadata, Viewport } from "next"
import { Bebas_Neue, Noto_Sans } from "next/font/google"
import { THEME_INIT_SCRIPT } from "@/lib/theme"
import { SmoothScroll } from "@/components/smooth-scroll"
import "./globals.css"

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
})

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
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
    { media: "(prefers-color-scheme: light)", color: "#fdfbf8" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1a19" },
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
      <body className={`${bebasNeue.variable} ${notoSans.variable} font-sans antialiased`}>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  )
}
