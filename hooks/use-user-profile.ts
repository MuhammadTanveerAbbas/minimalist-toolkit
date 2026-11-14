"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { getUserProfile, type UserProfile } from "@/lib/user-profile"

const EMPTY: UserProfile = {
  name: null,
  firstName: null,
  email: null,
  avatarUrl: null,
  initials: "",
}

interface CachedProfile {
  profile: UserProfile
  createdAt: string | null
  isLoading: boolean
}

let cache: CachedProfile = { profile: EMPTY, createdAt: null, isLoading: true }
let inFlight: Promise<CachedProfile> | null = null
const listeners = new Set<(next: CachedProfile) => void>()

/**
 * Loads the signed-in user once per page load and shares the result between
 * every consumer, so the shell, the dashboard and the profile page do not each
 * trigger their own request to the auth server.
 */
function loadProfile(): Promise<CachedProfile> {
  if (inFlight) return inFlight

  const request = createClient()
    .auth.getUser()
    .then(({ data }: { data: { user?: any } | null }) => {
      const next: CachedProfile = {
        profile: getUserProfile(data?.user ?? null),
        createdAt: data?.user?.created_at ?? null,
        isLoading: false,
      }
      cache = next
      listeners.forEach((listener) => listener(next))
      return next
    })
    .catch(() => {
      const next: CachedProfile = { profile: EMPTY, createdAt: null, isLoading: false }
      cache = next
      listeners.forEach((listener) => listener(next))
      return next
    })
    .finally(() => {
      inFlight = null
    })

  inFlight = request
  return request
}

/**
 * Reads the signed-in user and normalises it into display fields.
 *
 * The session is Google OAuth, so the profile picture and full name come
 * from the provider metadata attached to the Supabase user.
 */
export function useUserProfile(): UserProfile & { isLoading: boolean; createdAt: string | null } {
  const [state, setState] = useState<CachedProfile>(cache)

  useEffect(() => {
    const listener = (next: CachedProfile) => setState(next)
    listeners.add(listener)
    loadProfile()

    const { data } = createClient().auth.onAuthStateChange((_event: string, session: { user?: unknown } | null) => {
      if (!session?.user) {
        const next: CachedProfile = { profile: EMPTY, createdAt: null, isLoading: false }
        cache = next
        inFlight = null
        listeners.forEach((l) => l(next))
        return
      }
      inFlight = null
      cache = { ...cache, isLoading: true }
      loadProfile()
    })

    return () => {
      listeners.delete(listener)
      data.subscription.unsubscribe()
    }
  }, [])

  return { ...state.profile, createdAt: state.createdAt, isLoading: state.isLoading }
}
