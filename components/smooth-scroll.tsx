"use client"

import { useCallback, useSyncExternalStore } from "react"
import { ReactLenis } from "lenis/react"
import "lenis/dist/lenis.css"

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

function subscribe(onChange: () => void) {
  const media = window.matchMedia(REDUCED_MOTION_QUERY)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

/**
 * Lenis smooth scrolling for the marketing surfaces. It is skipped entirely
 * when the visitor prefers reduced motion, so scrolling stays native there.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useSyncExternalStore(
    subscribe,
    useCallback(() => window.matchMedia(REDUCED_MOTION_QUERY).matches, []),
    () => false
  )

  if (prefersReducedMotion) return <>{children}</>

  return (
    <ReactLenis
      root
      autoRaf
      options={{
        lerp: 0.09,
        wheelMultiplier: 1,
        touchMultiplier: 1.4,
        smoothWheel: true,
        anchors: true,
        allowNestedScroll: true,
        stopInertiaOnNavigate: true,
        respectReducedMotion: true,
      }}
    >
      {children}
    </ReactLenis>
  )
}
