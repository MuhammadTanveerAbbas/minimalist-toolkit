"use client"

import { useCallback, useSyncExternalStore } from "react"
import {
  applyTheme,
  readStoredTheme,
  resolveTheme,
  THEME_STORAGE_KEY,
  type Theme,
} from "@/lib/theme"

const EVENT = "toolkit-theme-change"

function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)")

  const onMediaChange = () => {
    // Only a "system" theme follows the operating system.
    if (readStoredTheme() === "system") {
      applyTheme("system")
      onChange()
    }
  }

  window.addEventListener("storage", onChange)
  window.addEventListener(EVENT, onChange)
  media.addEventListener("change", onMediaChange)

  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(EVENT, onChange)
    media.removeEventListener("change", onMediaChange)
  }
}

function getSnapshot(): Theme {
  return readStoredTheme()
}

function getServerSnapshot(): Theme {
  return "system"
}

/**
 * Reads and writes the theme choice.
 *
 * The first paint is handled by the blocking script in the document head, so
 * this hook only keeps the interface in sync with the stored choice.
 */
export function useTheme(): {
  theme: Theme
  isDark: boolean
  setTheme: (theme: Theme) => void
  toggle: () => void
} {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  // Resolve "system" against matchMedia on the client, but fall back to false
  // during SSR/hydration so the server and client first paint agree.
  const isDark = useSyncExternalStore(
    subscribe,
    () => resolveTheme(readStoredTheme()),
    () => false
  )

  const setTheme = useCallback((next: Theme) => {
    applyTheme(next)
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Storage may be unavailable. The theme still applies for this session.
    }
    window.dispatchEvent(new Event(EVENT))
  }, [])

  const toggle = useCallback(() => {
    setTheme(resolveTheme(theme) ? "light" : "dark")
  }, [setTheme, theme])

  return { theme, isDark, setTheme, toggle }
}
