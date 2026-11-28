/** Shared public copy so the layout, landing page and social cards stay in sync. */
export const siteName = "Minimalist Toolkit"

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://minimalist-toolkit.vercel.app"

export const siteLogo = new URL("/logo-light.png", siteUrl).toString()

export const twitterHandle = "@m_tanveerabbas"

export const siteTitle =
  "Minimalist Toolkit: Snippets, Mockups, Prompts & AI Chat"

export const siteDescription =
  "Save and organise code snippets, generate mockups, write better prompts, and chat with AI in one clean workspace. Your data stays yours. Free to start."

/** Short copy for social cards, which truncate around 125 characters. */
export const siteDescriptionShort =
  "Save code snippets, generate mockups, write better prompts, and chat with AI in one clean workspace. Your data stays yours."
