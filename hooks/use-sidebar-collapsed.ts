"use client"

import { useCallback, useSyncExternalStore } from "react"

const STORAGE_KEY = "workspace-sidebar-collapsed"
const EVENT = "toolkit-sidebar-collapsed-change"

function readCollapsed(): boolean {
  if (typeof window === "undefined") return false
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange)
  window.addEventListener(EVENT, onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(EVENT, onChange)
  }
}

/** Reads the persisted sidebar collapsed state without a cascading render. */
export function useSidebarCollapsed(): boolean {
  return useSyncExternalStore(subscribe, readCollapsed, () => false)
}

/** Writes the sidebar collapsed state and notifies subscribers. */
export function useSidebarCollapsedSetter(): (collapsed: boolean) => void {
  return useCallback((collapsed: boolean) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0")
    } catch {
      // Storage may be unavailable. The state still applies for this session.
    }
    window.dispatchEvent(new Event(EVENT))
  }, [])
}
