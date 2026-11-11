/**
 * Builds a readable file name for a generated image.
 *
 * `mockify-${slug}-${yyyy-mm-dd}.png`, e.g. `mockup-saas-landing-hero-2026-03-18.png`.
 */
export function buildImageFilename(prompt: string, date: Date = new Date()): string {
  const slug = prompt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .split("-")
    .filter(Boolean)
    .slice(0, 5)
    .join("-")

  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")

  return `mockup-${slug || "image"}-${yyyy}-${mm}-${dd}.png`
}
