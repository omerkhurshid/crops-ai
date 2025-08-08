import NextAuth from 'next-auth'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { UserRole } from '@crops-ai/shared'

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Demo users
        const demoUsers = [
          { id: '1', email: 'demo@crops.ai', password: 'Demo123!', name: 'Demo User', role: UserRole.FARM_OWNER },
          { id: '2', email: 'admin@crops.ai', password: 'Admin123!', name: 'Admin User', role: UserRole.ADMIN }
        ]

        const user = demoUsers.find(u => u.email === credentials.email && u.password === credentials.password)
        
        if (user) {
          return { 
            id: user.id, 
            email: user.email, 
            name: user.name,
            role: user.role
          }
        }
        
        return null
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }