'use client'

/**
 * Unified Auth Provider
 * 
 * This component provides authentication context that works with both
 * NextAuth and Supabase Auth systems based on feature flags.
 * 
 * During migration:
 * - NEXT_PUBLIC_USE_SUPABASE_AUTH=false: Uses NextAuth (current system)
 * - NEXT_PUBLIC_USE_SUPABASE_AUTH=true: Uses Supabase Auth (new system)
 */

import React, { createContext, useContext, ReactNode } from 'react'
// SessionProvider import removed - Supabase-only auth now
import { useSession as useUnifiedSession, unifiedAuth, type UnifiedSession, isUsingSupabaseAuth } from '../../lib/auth-unified'

// Auth context type
interface AuthContextType {
  session: UnifiedSession | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  signIn: (email: string, password: string) => Promise<{ ok?: boolean; error?: string }>
  signOut: (options?: { callbackUrl?: string }) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<{ ok?: boolean; error?: string }>
  resetPassword: (email: string) => Promise<{ ok?: boolean; error?: string }>
  isUsingSupabase: boolean
}

// Create auth context
const AuthContext = createContext<AuthContextType | null>(null)

// Auth provider wrapper
function UnifiedAuthContent({ children }: { children: ReactNode }) {
  const { data: session, status } = useUnifiedSession()

  const contextValue: AuthContextType = {
    session,
    status,
    signIn: unifiedAuth.signIn,
    signOut: unifiedAuth.signOut,
    signUp: unifiedAuth.signUp,
    resetPassword: unifiedAuth.resetPassword,
    isUsingSupabase: isUsingSupabaseAuth()
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Main provider component
export function UnifiedAuthProvider({ children }: { children: ReactNode }) {
  console.log('🔐 UnifiedAuthProvider: Using Supabase authentication')

  // Supabase Auth only - no session provider wrapper needed
  return (
    <UnifiedAuthContent>
      {children}
    </UnifiedAuthContent>
  )
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within UnifiedAuthProvider')
  }
  return context
}

// Backwards compatibility hook that matches NextAuth's useSession
export function useSession() {
  const { session, status } = useAuth()
  return { data: session, status }
}

// Backwards compatibility functions that match NextAuth's exports
export function signIn(provider: string, options: { email: string; password: string; redirect: boolean }) {
  // This will be called by existing components
  // We'll handle it in the unified system
  return unifiedAuth.signIn(options.email, options.password)
}

export function signOut(options?: { callbackUrl?: string }) {
  return unifiedAuth.signOut(options)
}