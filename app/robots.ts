import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://minimalist-toolkit.vercel.app"
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/features", "/login", "/signup", "/forgot-password", "/llms.txt"],
        disallow: ["/app/", "/api/", "/auth/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
