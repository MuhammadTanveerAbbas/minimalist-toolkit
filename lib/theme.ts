/**
 * Theme handling for the workspace.
 *
 * Three values are supported: light, dark and "system". Light is the default.
 * The choice is written to localStorage and applied to the <html> element as a
 * "dark" class by a blocking script in the document head, so the correct
 * palette is painted on the first frame with no flash of the wrong theme.
 */

export type Theme = "light" | "dark" | "system"

export const THEME_STORAGE_KEY = "toolkit-theme"

export const THEMES: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

/** The theme used when a visitor has never chosen one. */
export const DEFAULT_THEME: Theme = "light"

/**
 * Runs before the first paint. Keep it small and dependency free.
 */
export const THEME_INIT_SCRIPT = `(function(){try{
var k=${JSON.stringify(THEME_STORAGE_KEY)};
var s=localStorage.getItem(k);
if(s!=="light"&&s!=="dark"&&s!=="system"){
var m=document.cookie.match(new RegExp("(?:^|; )"+k+"=([^;]*)"));
if(m){var v=decodeURIComponent(m[1]);if(v==="light"||v==="dark"||v==="system")s=v;}
}
if(s!=="light"&&s!=="dark"&&s!=="system")s="light";
var d=s==="dark"||(s==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);
var e=document.documentElement;
e.classList.toggle("dark",d);
e.style.colorScheme=d?"dark":"light";
e.dataset.theme=s;
}catch(e){}})();`

const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function readThemeCookie(): Theme | null {
  if (typeof document === "undefined") return null
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${THEME_STORAGE_KEY}=([^;]*)`))
    const value = match ? decodeURIComponent(match[1]) : ""
    if (value === "light" || value === "dark" || value === "system") return value
  } catch {
    // Ignore unreadable cookies.
  }
  return null
}

/** Mirrors the choice into a cookie so it survives localStorage being cleared. */
export function writeThemeCookie(theme: Theme): void {
  if (typeof document === "undefined") return
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${THEME_STORAGE_KEY}=${encodeURIComponent(theme)}; Path=/; Max-Age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax${secure}`
}

export function readStoredTheme(): Theme {
  if (typeof window === "undefined") return DEFAULT_THEME
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (value === "light" || value === "dark" || value === "system") return value
  } catch {
    // Storage may be unavailable. Try the cookie instead.
  }
  return readThemeCookie() ?? DEFAULT_THEME
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
  root.classList.add("theme-changing")
  root.classList.toggle("dark", dark)
  root.style.colorScheme = dark ? "dark" : "light"
  root.dataset.theme = theme
  // Release the guard once the new palette has painted. hover transitions stay
  // active, but the theme switch itself has no fade or reveal effect.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    root.classList.remove("theme-changing")
  }))
}
