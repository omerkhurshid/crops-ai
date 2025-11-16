/**
 * Supabase Authentication System
 * 
 * Primary authentication system using Supabase Auth.
 * NextAuth has been removed in favor of Supabase-only authentication.
 */
import { supabaseAuth, type SupabaseSession, type SupabaseUser } from './supabase'
import React, { useEffect, useState, useCallback } from 'react'
// Supabase-only authentication (NextAuth removed)
const USE_SUPABASE_AUTH = true
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
  user?: {
    id: string
    email: string
    email_confirmed_at?: string
  }
}
// Supabase-only auth functions
export const unifiedAuth = {
  // Sign in using Supabase authentication
  signIn: async (email: string, password: string): Promise<AuthResult> => {
    try {
      // First try migration endpoint for existing users
      const migrationResponse = await fetch('/api/auth/supabase-signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (migrationResponse.ok) {
        const data = await migrationResponse.json()
        if (data.migrated || data.legacy) {
          // User migrated or handled via legacy system
          return { ok: true }
        }
      }
      // Direct Supabase sign in
      const { data, error } = await supabaseAuth.signIn(email, password)
      if (error) {
        return { error: error.message }
      }
      
      // Ensure session is properly established
      if (data?.session) {
        console.log('✅ Session established:', data.session.user.id)
        
        // The session should now be persisted by Supabase client automatically
        // The middleware will handle server-side session refresh
      }
      
      return { ok: true }
    } catch (error) {
      return { error: 'Authentication failed' }
    }
  },
  // Sign out using Supabase
  signOut: async (options?: { callbackUrl?: string }): Promise<void> => {
    await supabaseAuth.signOut()
    if (options?.callbackUrl) {
      window.location.href = options.callbackUrl
    }
  },
  // Sign up using Supabase
  signUp: async (email: string, password: string, name: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabaseAuth.signUp(email, password, { name })
      if (error) {
        return { error: error.message }
      }
      return { 
        ok: true,
        user: data?.user ? {
          id: data.user.id,
          email: data.user.email || email,
          email_confirmed_at: data.user.email_confirmed_at
        } : undefined
      }
    } catch (error) {
      return { error: 'Registration failed' }
    }
  },
  // Password reset using Supabase
  resetPassword: async (email: string): Promise<AuthResult> => {
    const { error } = await supabaseAuth.resetPassword(email)
    if (error) {
      return { error: error.message }
    }
    return { ok: true }
  }
}
// Supabase session hook
export function useSession(): { data: UnifiedSession | null; status: 'loading' | 'authenticated' | 'unauthenticated' } {
  const [session, setSession] = useState<UnifiedSession | null>(null)
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  useEffect(() => {
    // Get initial session
    supabaseAuth.getSession().then(({ session }) => {
      if (session?.user) {
        setSession({
          user: {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email || '',
            role: session.user.user_metadata?.role || 'FARM_OWNER'
          }
        })
        setStatus('authenticated')
      } else {
        setSession(null)
        setStatus('unauthenticated')
      }
    })
    // Listen for auth changes
    const { data: { subscription } } = supabaseAuth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setSession({
          user: {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email || '',
            role: session.user.user_metadata?.role || 'FARM_OWNER'
          }
        })
        setStatus('authenticated')
      } else {
        setSession(null)
        setStatus('unauthenticated')
      }
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  return {
    data: session,
    status: status
  }
}
// Export auth configuration flag for components that need it
export const isUsingSupabaseAuth = () => true
// Simple context provider for backward compatibility
export function AuthContextProvider({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children)
}