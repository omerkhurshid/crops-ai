import NextAuth from 'next-auth'
import { authOptions } from '../../../../lib/auth'

// Add logging for debugging
console.log('🚀 NextAuth route initialized')
console.log('🔑 Auth options loaded:', !!authOptions)

// Initialize NextAuth handler
const handler = NextAuth(authOptions)

// Debug wrapper to log all requests
const debugHandler = async (req: Request, context: any) => {
  console.log('🌐 NextAuth Route Called:', {
    method: req.method,
    url: req.url,
    params: context?.params,
    timestamp: new Date().toISOString()
  })
  
  try {
    const response = await handler(req, context)
    console.log('✅ NextAuth Response Generated')
    return response
  } catch (error) {
    console.error('❌ NextAuth Handler Error:', error)
    throw error
  }
}

// Export for all HTTP methods that NextAuth needs
export { 
  debugHandler as GET, 
  debugHandler as POST,
  debugHandler as PUT,
  debugHandler as DELETE,
  debugHandler as PATCH
}