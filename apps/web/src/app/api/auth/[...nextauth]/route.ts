import NextAuth from 'next-auth'
import { authOptions } from '../../../../lib/auth'

// Initialize NextAuth handler
const handler = NextAuth(authOptions)

// Export for all HTTP methods that NextAuth needs
export { 
  handler as GET, 
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as PATCH
}