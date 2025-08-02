import { getServerSession } from 'next-auth/next'
import { getToken } from 'next-auth/jwt'
import { NextRequest } from 'next/server'
import { authOptions } from '../auth'
import { UserRole } from '@crops-ai/shared'
import { AuthenticationError, AuthorizationError } from '../api/errors'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: UserRole
}

/**
 * Get the current user session on the server side
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return null
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Get user session from request (for API routes)
 */
export async function getUserFromRequest(req: NextRequest): Promise<SessionUser | null> {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET
    })

    if (!token || !token.email) {
      return null
    }

    return {
      id: token.id as string,
      email: token.email,
      name: token.name || 'Unknown User',
      role: token.role as UserRole
    }
  } catch (error) {
    console.error('Error getting user from request:', error)
    return null
  }
}

/**
 * Require authentication for API routes
 */
export async function requireAuth(req: NextRequest): Promise<SessionUser> {
  const user = await getUserFromRequest(req)
  
  if (!user) {
    throw new AuthenticationError('Authentication required')
  }

  return user
}

/**
 * Require specific role for API routes
 */
export async function requireRole(
  req: NextRequest, 
  allowedRoles: UserRole[]
): Promise<SessionUser> {
  const user = await requireAuth(req)

  if (!allowedRoles.includes(user.role)) {
    throw new AuthorizationError(
      `Access denied. Required roles: ${allowedRoles.join(', ')}`
    )
  }

  return user
}

/**
 * Require admin role
 */
export async function requireAdmin(req: NextRequest): Promise<SessionUser> {
  return requireRole(req, [UserRole.ADMIN])
}

/**
 * Check if user has any of the specified roles
 */
export function hasRole(user: SessionUser, roles: UserRole[]): boolean {
  return roles.includes(user.role)
}

/**
 * Check if user is admin
 */
export function isAdmin(user: SessionUser): boolean {
  return user.role === UserRole.ADMIN
}

/**
 * Check if user is farm owner
 */
export function isFarmOwner(user: SessionUser): boolean {
  return user.role === UserRole.FARM_OWNER
}

/**
 * Check if user is farm manager
 */
export function isFarmManager(user: SessionUser): boolean {
  return user.role === UserRole.FARM_MANAGER
}

/**
 * Check if user is agronomist
 */
export function isAgronomist(user: SessionUser): boolean {
  return user.role === UserRole.AGRONOMIST
}

/**
 * Get user permissions summary
 */
export function getUserPermissions(user: SessionUser) {
  const basePermissions = {
    canViewDashboard: true,
    canViewProfile: true,
    canUpdateProfile: true,
  }

  switch (user.role) {
    case UserRole.ADMIN:
      return {
        ...basePermissions,
        canManageUsers: true,
        canManageAllFarms: true,
        canViewAllData: true,
        canManageSystem: true,
        canDeleteAnyResource: true,
      }

    case UserRole.FARM_OWNER:
      return {
        ...basePermissions,
        canCreateFarms: true,
        canManageOwnedFarms: true,
        canInviteManagers: true,
        canViewOwnedFarmData: true,
        canDeleteOwnedResources: true,
      }

    case UserRole.FARM_MANAGER:
      return {
        ...basePermissions,
        canManageManagedFarms: true,
        canCreateFields: true,
        canManageCrops: true,
        canViewManagedFarmData: true,
        canUpdateManagedResources: true,
      }

    case UserRole.AGRONOMIST:
      return {
        ...basePermissions,
        canViewFarmData: true,
        canProviderecommendations: true,
        canAnalyzeCrops: true,
        canViewReports: true,
      }

    default:
      return basePermissions
  }
}

/**
 * Session debugging utilities for development
 */
export class SessionDebug {
  static async logCurrentSession() {
    if (process.env.NODE_ENV !== 'development') return

    try {
      const session = await getServerSession(authOptions)
      console.log('Current session:', {
        user: session?.user ? {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role
        } : null,
        expires: session?.expires
      })
    } catch (error) {
      console.log('Session debug error:', error)
    }
  }

  static logUserPermissions(user: SessionUser) {
    if (process.env.NODE_ENV !== 'development') return

    console.log('User permissions:', {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      permissions: getUserPermissions(user)
    })
  }
}