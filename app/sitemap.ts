import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://minimalist-toolkit.vercel.app"
  const now = new Date()

  const publicRoutes: { route: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }[] = [
    { route: "/", priority: 1, changeFrequency: "weekly" },
    { route: "/features", priority: 0.7, changeFrequency: "monthly" },
    { route: "/login", priority: 0.5, changeFrequency: "yearly" },
    { route: "/signup", priority: 0.6, changeFrequency: "yearly" },
    { route: "/forgot-password", priority: 0.3, changeFrequency: "yearly" },
  ]

  return publicRoutes.map(({ route, priority, changeFrequency }) => ({
    url: `${siteUrl}${route === "/" ? "" : route}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))
}
