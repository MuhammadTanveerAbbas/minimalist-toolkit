"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  src?: string | null
  name?: string | null
  initials?: string
  /** Rendered size in pixels for the round image. */
  size?: number
  className?: string
}

/**
 * Shows the Google profile picture for the signed-in user and falls back to
 * initials when there is no picture or the remote image fails to load.
 */
export function UserAvatar({
  src,
  name,
  initials,
  size = 28,
  className,
}: UserAvatarProps) {
  const [failed, setFailed] = useState(false)

  const dimension = { width: size, height: size }
  const label = name?.trim() || "User"

  if (!src || failed) {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand font-semibold text-brand-foreground",
          className
        )}
        style={{ ...dimension, fontSize: Math.max(10, Math.round(size * 0.4)) }}
        aria-hidden="true"
      >
        {initials || label.charAt(0).toUpperCase()}
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${label} profile picture`}
      onError={() => setFailed(true)}
      referrerPolicy="no-referrer"
      className={cn("shrink-0 rounded-full border border-border object-cover", className)}
      style={dimension}
    />
  )
}
