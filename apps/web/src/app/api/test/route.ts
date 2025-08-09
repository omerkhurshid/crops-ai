import { NextRequest } from 'next/server'
import { apiMiddleware, withMethods } from '../../../lib/api/middleware'
import { createSuccessResponse } from '../../../lib/api/errors'

export async function GET() {
  return Response.json({ message: 'App directory routing working', timestamp: new Date().toISOString() })
}

// Test protected endpoint
export const POST = apiMiddleware.protected(
  withMethods(['POST'], async (request: any) => {
    try {
      console.log('🧪 Test protected API called')
      console.log('🧑 User from request:', request.user)
      
      const body = await request.json()
      console.log('📝 Test request body:', body)
      
      return createSuccessResponse({
        message: 'Protected test API working',
        user: request.user,
        receivedBody: body,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('❌ Test API error:', error)
      throw error
    }
  })
)