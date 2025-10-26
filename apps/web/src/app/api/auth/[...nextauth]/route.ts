import NextAuth from 'next-auth'
import type { NextRequest } from 'next/server'
import { authOptions } from '../../../../lib/auth'

// Create the NextAuth handler
const handler = NextAuth(authOptions)

// Simple wrapper with logging
async function authHandler(req: NextRequest, context: { params: { nextauth: string[] } }) {
  console.log('🌐 NextAuth Route Called:', {
    method: req.method,
    url: req.url,
    params: context.params.nextauth,
    timestamp: new Date().toISOString()
  })
  
  try {
    const response = await handler(req, context)
    console.log('✅ NextAuth Response:', response.status)
    return response
  } catch (error) {
    console.error('❌ NextAuth Error:', error)
    throw error
  }
}

export { authHandler as GET, authHandler as POST }