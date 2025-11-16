/**
 * Production-ready Supabase Authentication System
 * 
 * Following Supabase SSR best practices for Next.js App Router
 */
import { createClient } from './supabase/client'
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
// Production authentication functions
export const unifiedAuth = {
  // Sign in using Supabase authentication
  signIn: async (email: string, password: string): Promise<AuthResult> => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        return { error: error.message }
      }
      
      if (data?.session) {
        console.log('✅ Authentication successful')
        // Session cookies will be automatically handled by Supabase SSR
        return { ok: true }
      }
      
      return { error: 'No session created' }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: 'Authentication failed' }
    }
  },
  // Sign out using Supabase
  signOut: async (options?: { callbackUrl?: string }): Promise<void> => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      if (options?.callbackUrl) {
        window.location.href = options.callbackUrl
      }
    } catch (error) {
      console.error('Sign out error:', error)
    }
  },
  
  // Sign up using Supabase
  signUp: async (email: string, password: string, name: string): Promise<AuthResult> => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      })
      
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
      console.error('Sign up error:', error)
      return { error: 'Registration failed' }
    }
  },
  
  // Password reset using Supabase
  resetPassword: async (email: string): Promise<AuthResult> => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) {
        return { error: error.message }
      }
      return { ok: true }
    } catch (error) {
      console.error('Reset password error:', error)
      return { error: 'Password reset failed' }
    }
  }
}
// Production session hook
export function useSession(): { data: UnifiedSession | null; status: 'loading' | 'authenticated' | 'unauthenticated' } {
  const [session, setSession] = useState<UnifiedSession | null>(null)
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  
  useEffect(() => {
    const supabase = createClient()
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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