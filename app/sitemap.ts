import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://minimalist-toolkit.vercel.app"
  const now = new Date()
  const routes = ["/", "/features", "/login", "/signup", "/forgot-password"]
  return routes.map((route) => ({
    url: `${siteUrl}${route === "/" ? "" : route}`,
    lastModified: now,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.6,
  }))
}
