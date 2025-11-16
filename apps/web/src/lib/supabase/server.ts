/**
 * Supabase Server Configuration for Server Components and API Routes
 * Follows Supabase SSR best practices for Next.js App Router
 */
import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Environment validation with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://drtbsioeqfodcaelukpo.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRydGJzaW9lcWZvZGNhZWx1a3BvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDkwNzAyOTAsImV4cCI6MjAyNDY0NjI5MH0.K8fKnZfMq4hqfmDQhzxnZRdHtN8L9xJtYrShQzjBpHo'

/**
 * Create Supabase client for Server Components
 * Use this in Server Components that don't modify cookies
 */
export const createClient = () => {
  const cookieStore = cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll() {
        // Server components are read-only, no cookie setting
      },
    },
  })
}

/**
 * Create Supabase client for API Routes
 * Use this in API routes that may need to modify cookies
 */
export const createRouteHandlerClient = (request: NextRequest) => {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  return { supabase, response }
}

/**
 * Create Supabase client for Middleware
 * Use this in middleware.ts for session refresh
 */
export const createMiddlewareClient = (request: NextRequest) => {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value)
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  return { supabase, response }
}