import { NextRequest } from 'next/server'
import { UserRole } from '@prisma/client'

export interface GraphQLContext {
  user?: {
    id: string
    email: string
    name: string
    role: UserRole
  }
  req: NextRequest
}

export async function createContext(req: NextRequest): Promise<GraphQLContext> {
  let user = undefined

  try {
    // Use Supabase authentication from our server auth utility
    const { getAuthenticatedUser } = await import('../auth/server')
    const authenticatedUser = await getAuthenticatedUser(req)
    
    if (authenticatedUser) {
      user = {
        id: authenticatedUser.id,
        email: authenticatedUser.email,
        name: authenticatedUser.name,
        role: authenticatedUser.role
      }
    }
  } catch (error) {
    // Authentication failed, user remains undefined
    console.error('GraphQL context authentication error:', error)
  }

  return {
    user,
    req
  }
}