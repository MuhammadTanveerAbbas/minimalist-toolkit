'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Code2, Loader2 } from 'lucide-react'

export default function LoginPage({ mode = 'login' }: { mode?: 'login' | 'signup' }) {
  const searchParams = useSearchParams()
  const authError = searchParams.get('error')
  const next = searchParams.get('next')
  const supabase = createClient()
  const [localError, setLocalError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const signInWithGoogle = async () => {
    if (isLoading) return
    setLocalError(null)
    setIsLoading(true)
    try {
      const redirect = new URL('/auth/callback', location.origin)
      if (next && next.startsWith('/')) redirect.searchParams.set('next', next)
      const { error: authErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirect.toString() },
      })
      if (authErr) {
        setLocalError(authErr.message || 'Unable to sign in. Please try again.')
        setIsLoading(false)
      }
    } catch {
      setLocalError('Unable to sign in. Please try again.')
      setIsLoading(false)
    }
  }

  const displayError = localError || authError

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-8 sm:py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center sm:mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-semibold tracking-tight transition-opacity duration-150 hover:opacity-80">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card">
              <Code2 className="h-4 w-4" />
            </span>
            <span>Minimalist Toolkit</span>
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="space-y-2 text-center">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              {mode === 'signup'
                ? 'Sign up to access Snippet Manager, Mockify, PromptCraft, and AI chat.'
                : 'Sign in to open your workspace.'}
            </p>
          </div>

          <div className="mt-5 space-y-4">
            {displayError ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive" role="alert">
                {displayError}
              </p>
            ) : null}

            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={isLoading}
              className="flex min-h-11 w-full items-center justify-center gap-3 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors duration-150 hover:bg-muted/50 disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                  <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05" />
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                </svg>
              )}
              {isLoading ? 'Continuing...' : 'Continue with Google'}
            </button>

            <div className="space-y-2 text-center text-sm text-muted-foreground">
              <p>
                {mode === 'signup' ? (
                  <>Already have an account? <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">Log in</Link></>
                ) : (
                  <>New here? <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">Create an account</Link></>
                )}
              </p>
              <p>
                <Link href="/forgot-password" className="underline-offset-4 hover:text-foreground hover:underline">Need help signing in?</Link>
              </p>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          <Link href="/" className="underline-offset-4 hover:text-foreground hover:underline">Back to home</Link>
        </p>
      </div>
    </div>
  )
}
