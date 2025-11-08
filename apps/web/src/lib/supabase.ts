import { createClient } from '@supabase/supabase-js'
// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
// Create Supabase client only if environment variables are available
// This prevents build-time errors when Supabase isn't configured yet
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    })
  : null
// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => !!(supabaseUrl && supabaseAnonKey && supabase)
// Types matching existing NextAuth structure
export interface SupabaseUser {
  id: string
  email: string
  name: string
  role: 'FARM_OWNER' | 'FARM_MANAGER' | 'AGRONOMIST' | 'ADMIN'
}
export interface SupabaseSession {
  user: SupabaseUser
  access_token: string
  expires_at?: number
}
// Auth helper functions that match NextAuth patterns
export const supabaseAuth = {
  // Sign up new user
  signUp: async (email: string, password: string, userData?: { name?: string }) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },
  // Sign in with email/password
  signIn: async (email: string, password: string) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } }
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },
  // Sign out
  signOut: async () => {
    if (!supabase) {
      return { error: { message: 'Supabase not configured' } }
    }
    const { error } = await supabase.auth.signOut()
    return { error }
  },
  // Get current session
  getSession: async () => {
    if (!supabase) {
      return { session: null, error: { message: 'Supabase not configured' } }
    }
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },
  // Get current user
  getUser: async () => {
    if (!supabase) {
      return { user: null, error: { message: 'Supabase not configured' } }
    }
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },
  // Auth state change listener
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    if (!supabase) {
      return { data: { subscription: { unsubscribe: () => {} } } }
    }
    return supabase.auth.onAuthStateChange(callback)
  },
  // Password reset
  resetPassword: async (email: string) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } }
    }
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
    })
    return { data, error }
  },
  // Update password
  updatePassword: async (password: string) => {
    if (!supabase) {
      return { data: null, error: { message: 'Supabase not configured' } }
    }
    const { data, error } = await supabase.auth.updateUser({ password })
    return { data, error }
  }
}
// Database helper for user profile management
export const supabaseDB = {
  // Get user profile from our custom Prisma database
  getUserProfile: async (userId: string) => {
    // This will be implemented to work with existing Prisma setup
    // For now, return mock structure
    return null
  },
  // Update user profile
  updateUserProfile: async (userId: string, updates: Partial<SupabaseUser>) => {
    // This will integrate with existing Prisma User model
    return null
  }
}