/**
 * Supabase Client Configuration for Client-side Components
 * Follows Supabase SSR best practices for Next.js App Router
 */
import { createBrowserClient } from '@supabase/ssr'

// Environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const createClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}