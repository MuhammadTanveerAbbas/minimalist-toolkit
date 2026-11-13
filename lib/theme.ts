/**
 * Theme handling for the workspace.
 *
 * Three values are supported: an explicit light or dark choice, and "system",
 * which follows the operating system preference. The choice is written to
 * localStorage and applied to the <html> element as a "dark" class by a
 * blocking script in the document head, so the correct palette is painted on
 * the first frame with no flash of the wrong theme.
 */

export type Theme = "light" | "dark" | "system"

export const THEME_STORAGE_KEY = "toolkit-theme"

export const THEMES: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

/**
 * Runs before the first paint. Keep it small and dependency free.
 */
export const THEME_INIT_SCRIPT = `(function(){try{
var k=${JSON.stringify(THEME_STORAGE_KEY)};
var s=localStorage.getItem(k)||"system";
var d=s==="dark"||(s==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);
var e=document.documentElement;
e.classList.toggle("dark",d);
e.style.colorScheme=d?"dark":"light";
e.dataset.theme=s;
}catch(e){}})();`

export function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system"
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (value === "light" || value === "dark" || value === "system") return value
  } catch {
    // Storage may be unavailable. The system preference still applies.
  }
  return "system"
}

export function resolveTheme(theme: Theme): boolean {
  if (theme === "dark") return true
  if (theme === "light") return false
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return
  const dark = resolveTheme(theme)
  const root = document.documentElement
  root.classList.toggle("dark", dark)
  root.style.colorScheme = dark ? "dark" : "light"
  root.dataset.theme = theme
}
