import { readFile } from "node:fs/promises"
import { join } from "node:path"

export const runtime = "nodejs"
export const alt =
  "Minimalist Toolkit: snippets, mockups, prompts and AI chat. Try it free."
export const size = { width: 1200, height: 600 }
export const contentType = "image/png"

/** Serve the prebuilt card so the image never depends on runtime rendering. */
export default async function Image() {
  const data = await readFile(join(process.cwd(), "public/twitter-image.png"))
  return new Response(data, {
    headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=31536000, immutable" },
  })
}
