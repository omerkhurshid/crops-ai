/**
 * Unified Auth System
 * 
 * This provides a single interface that works with both NextAuth and Supabase Auth,
 * allowing for zero-downtime migration between authentication systems.
 * 
 * Use NEXT_PUBLIC_USE_SUPABASE_AUTH environment variable to control which system is active.
 */

import { supabaseAuth, type SupabaseSession, type SupabaseUser } from './supabase'
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, useSession as useNextAuthSession } from 'next-auth/react'
import { useEffect, useState, useCallback } from 'react'

// Feature flag
const USE_SUPABASE_AUTH = process.env.NEXT_PUBLIC_USE_SUPABASE_AUTH === 'true'

// Unified session type that matches NextAuth structure
export interface UnifiedSession {
  user: {
    id: string
    email: string
    name: string
    role: 'FARM_OWNER' | 'FARM_MANAGER' | 'AGRONOMIST' | 'ADMIN'
  }
}

export interface AuthResult {
  ok?: boolean
  error?: string
  url?: string
}

// Unified auth functions
export const unifiedAuth = {
  // Sign in function that works with both systems
  signIn: async (email: string, password: string): Promise<AuthResult> => {
    if (USE_SUPABASE_AUTH) {
      try {
        // For Supabase auth, we'll use a migration API endpoint
        // to handle existing bcrypt users during transition
        const response = await fetch('/api/auth/supabase-signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })

        if (response.ok) {
          const data = await response.json()
          if (data.needsMigration) {
            // User exists in old system, migrate to Supabase
            const { error } = await supabaseAuth.signIn(email, password)
            if (error) {
              return { error: error.message }
            }
          }
          return { ok: true }
        } else {
          const data = await response.json()
          return { error: data.error || 'Authentication failed' }
        }
      } catch (error) {
        return { error: 'Authentication failed' }
      }
    } else {
      // Use NextAuth
      const result = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false
      })

      return {
        ok: result?.ok,
        error: result?.error || undefined,
        url: result?.url
      }
    }
  },

  // Sign out function
  signOut: async (options?: { callbackUrl?: string }): Promise<void> => {
    if (USE_SUPABASE_AUTH) {
      await supabaseAuth.signOut()
      if (options?.callbackUrl) {
        window.location.href = options.callbackUrl
      }
    } else {
      await nextAuthSignOut(options)
    }
  },

  // Sign up function
  signUp: async (email: string, password: string, name: string): Promise<AuthResult> => {
    if (USE_SUPABASE_AUTH) {
      try {
        const { data, error } = await supabaseAuth.signUp(email, password, { name })
        if (error) {
          return { error: error.message }
        }
        return { ok: true }
      } catch (error) {
        return { error: 'Registration failed' }
      }
    } else {
      // Use existing registration API route
      try {
        const response = await fetch('/api/user-auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name })
        })

        if (response.ok) {
          return { ok: true }
        } else {
          const data = await response.json()
          return { error: data.error || 'Registration failed' }
        }
      } catch (error) {
        return { error: 'Registration failed' }
      }
    }
  },

  // Password reset
  resetPassword: async (email: string): Promise<AuthResult> => {
    if (USE_SUPABASE_AUTH) {
      const { error } = await supabaseAuth.resetPassword(email)
      if (error) {
        return { error: error.message }
      }
      return { ok: true }
    } else {
      // Use existing forgot password API
      try {
        const response = await fetch('/api/user-auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })

        if (response.ok) {
          return { ok: true }
        } else {
          const data = await response.json()
          return { error: data.error || 'Password reset failed' }
        }
      } catch (error) {
        return { error: 'Password reset failed' }
      }
    }
  }
}

// Unified session hook that works with both systems
export function useSession(): { data: UnifiedSession | null; status: 'loading' | 'authenticated' | 'unauthenticated' } {
  const nextAuthSession = useNextAuthSession()
  const [supabaseSession, setSupabaseSession] = useState<UnifiedSession | null>(null)
  const [supabaseStatus, setSupabaseStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')

  // Supabase session management
  useEffect(() => {
    if (!USE_SUPABASE_AUTH) return

    // Get initial session
    supabaseAuth.getSession().then(({ session }) => {
      if (session?.user) {
        // Transform Supabase session to match NextAuth structure
        setSupabaseSession({
          user: {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email || '',
            role: session.user.user_metadata?.role || 'FARM_OWNER'
          }
        })
        setSupabaseStatus('authenticated')
      } else {
        setSupabaseSession(null)
        setSupabaseStatus('unauthenticated')
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabaseAuth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setSupabaseSession({
          user: {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email || '',
            role: session.user.user_metadata?.role || 'FARM_OWNER'
          }
        })
        setSupabaseStatus('authenticated')
      } else {
        setSupabaseSession(null)
        setSupabaseStatus('unauthenticated')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Return appropriate session based on feature flag
  if (USE_SUPABASE_AUTH) {
    return {
      data: supabaseSession,
      status: supabaseStatus
    }
  } else {
    return {
      data: nextAuthSession.data as UnifiedSession | null,
      status: nextAuthSession.status
    }
  }
}

// Export auth configuration flag for components that need it
export const isUsingSupabaseAuth = () => USE_SUPABASE_AUTH