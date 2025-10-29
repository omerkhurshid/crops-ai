import NextAuth from 'next-auth'
import { authOptions } from '../../../../lib/auth'

// Test NextAuth OUTSIDE the /api/auth/ directory
const handler = NextAuth(authOptions)

export { 
  handler as GET, 
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as HEAD,
  handler as OPTIONS
}