import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Minimalist Toolkit",
    short_name: "Toolkit",
    description:
      "Six focused tools for code, visuals, prompts, client work and roadmap decisions. One account, one workspace.",
    start_url: "/app/dashboard",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    categories: ["productivity", "developer", "business"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  }
}
