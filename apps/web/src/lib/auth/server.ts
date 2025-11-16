/**
 * Server-side Supabase Authentication Utilities
 * 
 * Production-ready authentication helpers following Supabase SSR best practices
 */
import { NextRequest } from 'next/server'
import { createRouteHandlerClient } from '../supabase/server'
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
/**
 * Get authenticated user from API route request
 * Returns null if not authenticated
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const { supabase } = createRouteHandlerClient(request)
    
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