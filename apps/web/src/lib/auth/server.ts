/**
 * Server-side Supabase Authentication Utilities
 * 
 * This module provides server-side authentication helpers for API routes
 * using Supabase Auth with JWT token validation.
 */
import { createServerClient } from '@supabase/ssr'
import { NextRequest } from 'next/server'
import { logger } from '../logger'
// Server-side Supabase client for authentication
function createSupabaseServerClient(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null
  }

  // Check for Authorization header first
  const authHeader = request.headers.get('Authorization')
  const accessToken = authHeader?.replace('Bearer ', '')

  if (accessToken) {
    // If we have a Bearer token, use it directly
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          detectSessionInUrl: false,
          persistSession: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
        cookies: {
          getAll() {
            return []
          },
          setAll() {
            // No-op for token-based auth
          },
        },
      }
    )
  }

  // Fallback to cookie-based auth
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // For API routes, we don't modify response cookies
          // The middleware will handle session refresh
        },
      },
    }
  )
}
export interface AuthenticatedUser {
  id: string
  email: string
  name: string
  role: 'FARM_OWNER' | 'FARM_MANAGER' | 'AGRONOMIST' | 'ADMIN'
}
/**
 * Get the authenticated user from the request
 * Returns null if not authenticated
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Debug: Log authentication method being used
    const authHeader = request.headers.get('Authorization')
    const accessToken = authHeader?.replace('Bearer ', '')
    const hasAuthToken = !!accessToken
    const cookies = request.cookies.getAll()
    const authCookies = cookies.filter(c => c.name.includes('supabase'))
    
    logger.debug('=== AUTHENTICATION DEBUG ===')
    logger.debug(`URL: ${request.url}`)
    logger.debug(`Method: ${request.method}`)
    logger.debug(`Authentication method: ${hasAuthToken ? 'Bearer token' : 'Cookies'}`)
    logger.debug(`Auth cookies found: ${authCookies.length}`, authCookies.map(c => `${c.name}=${c.value?.substring(0, 20)}...`))
    if (hasAuthToken) {
      logger.debug('Bearer token present:', accessToken?.substring(0, 20) + '...')
    }

    const supabase = createSupabaseServerClient(request)
    if (!supabase) {
      logger.error('Supabase not configured - missing environment variables')
      logger.debug('NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
      logger.debug('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      return null
    }

    logger.debug('Calling supabase.auth.getUser()...')
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      logger.warn('Supabase auth error:', error.message, error.status)
      logger.debug('Error details:', JSON.stringify(error, null, 2))
      return null
    }
    
    if (!user) {
      logger.debug('No user found in session')
      return null
    }

    logger.debug('User authenticated successfully:', {
      id: user.id,
      email: user.email,
      aud: user.aud,
      created_at: user.created_at
    })
    logger.debug('=== END AUTHENTICATION DEBUG ===')
    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email || '',
      role: user.user_metadata?.role || 'FARM_OWNER'
    }
  } catch (error) {
    logger.error('Authentication error:', error)
    logger.debug('=== END AUTHENTICATION DEBUG (ERROR) ===')
    return null
  }
}
/**
 * Require authentication for an API route
 * Returns the authenticated user or throws an error
 */
export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(request)
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}
/**
 * Check if user has required role
 */
export function hasRole(user: AuthenticatedUser, requiredRole: AuthenticatedUser['role']): boolean {
  const roleHierarchy: Record<AuthenticatedUser['role'], number> = {
    'FARM_OWNER': 1,
    'FARM_MANAGER': 2, 
    'AGRONOMIST': 3,
    'ADMIN': 4
  }
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
}
/**
 * Require specific role for an API route
 */
export async function requireRole(
  request: NextRequest, 
  requiredRole: AuthenticatedUser['role']
): Promise<AuthenticatedUser> {
  const user = await requireAuth(request)
  if (!hasRole(user, requiredRole)) {
    throw new Error('Insufficient permissions')
  }
  return user
}