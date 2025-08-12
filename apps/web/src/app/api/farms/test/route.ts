import { NextRequest } from 'next/server'
import { getCurrentUser } from '../../../../lib/auth/session'
import { prisma } from '../../../../lib/prisma'

// Test endpoint without middleware to diagnose the issue
export async function GET(request: NextRequest) {
  try {
    console.log('=== FARMS TEST ENDPOINT ===')
    
    // Check authentication
    const user = await getCurrentUser()
    console.log('Current user:', user)
    
    if (!user) {
      return new Response(JSON.stringify({ 
        error: 'Not authenticated',
        message: 'Please login to view farms'
      }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }
    
    // Try to fetch farms directly
    const farms = await prisma.farm.findMany({
      where: {
        ownerId: user.id
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            fields: true,
            managers: true
          }
        }
      }
    })
    
    console.log(`Found ${farms.length} farms for user ${user.id}`)
    
    return new Response(JSON.stringify({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      farms,
      count: farms.length
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Test endpoint error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}