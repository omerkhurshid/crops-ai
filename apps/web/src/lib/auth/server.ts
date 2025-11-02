/**
 * Server-side Supabase Authentication Utilities
 * 
 * This module provides server-side authentication helpers for API routes
 * using Supabase Auth with JWT token validation.
 */

import { createServerClient } from '@supabase/ssr'
import { NextRequest } from 'next/server'
import { getConfig } from '../config/environment'

// Server-side Supabase client for authentication
function createSupabaseServerClient(request: NextRequest) {
  const config = getConfig()
  
  if (!config.NEXT_PUBLIC_SUPABASE_URL || !config.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null
  }

  return createServerClient(
    config.NEXT_PUBLIC_SUPABASE_URL,
    config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set() {
          // For API routes, we don't need to set cookies
        },
        remove() {
          // For API routes, we don't need to remove cookies
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
    const supabase = createSupabaseServerClient(request)
    
    if (!supabase) {
      // Supabase not configured, return null
      return null
    }

    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.email || '',
      role: user.user_metadata?.role || 'FARM_OWNER'
    }
  } catch (error) {
    console.error('Authentication error:', error)
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