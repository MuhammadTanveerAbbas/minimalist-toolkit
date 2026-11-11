/**
 * Module resolution hook for the calculation checks.
 *
 * The application source uses extensionless relative imports, which the
 * bundler resolves but Node's ESM loader does not. This hook adds the `.ts`
 * extension when a relative specifier has none, so the checks can run
 * against the real source with no bundler and no extra dependency.
 */
import { fileURLToPath, pathToFileURL } from "node:url"
import { existsSync } from "node:fs"
import { dirname, resolve as resolvePath } from "node:path"

const CANDIDATES = ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith(".") || specifier.startsWith("/")) {
    const base = context.parentURL
      ? dirname(fileURLToPath(context.parentURL))
      : process.cwd()

    if (!specifier.endsWith(".ts") && !specifier.endsWith(".tsx")) {
      const absolute = resolvePath(base, specifier)
      for (const candidate of CANDIDATES) {
        const target = `${absolute}${candidate}`
        if (existsSync(target)) {
          return nextResolve(pathToFileURL(target).href, context)
        }
      }
    }
  }

  return nextResolve(specifier, context)
}
