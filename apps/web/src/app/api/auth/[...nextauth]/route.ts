import NextAuth from 'next-auth'
import { authOptions } from '../../../../lib/auth'

// NextAuth v4 + App Router compatibility - Production Ready
const handler = NextAuth(authOptions)

export { 
  handler as GET, 
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as HEAD,
  handler as OPTIONS
}