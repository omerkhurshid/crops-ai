import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
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
    // Get the JWT token from the request
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET
    })

    if (token && token.email) {
      user = {
        id: token.id as string,
        email: token.email,
        name: token.name || 'Unknown User',
        role: token.role as UserRole
      }
    }
  } catch (error) {
    // Token validation failed, user remains undefined
    console.error('GraphQL context authentication error:', error)
  }

  return {
    user,
    req
  }
}