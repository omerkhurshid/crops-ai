import { NextAuthOptions } from 'next-auth'
// import { PrismaAdapter } from '@auth/prisma-adapter'
// import { prisma } from './prisma'
import CredentialsProvider from 'next-auth/providers/credentials'
import { UserRole } from '@crops-ai/shared'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  // Temporarily disable adapter to test NextAuth routing
  // adapter: PrismaAdapter(prisma) as any, // Type assertion to handle version compatibility
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

        // Demo mode - hardcoded users for testing without database
        const demoUsers = [
          {
            id: 'demo-1',
            email: 'demo@crops.ai',
            password: 'Demo123!',
            name: 'Demo User',
            role: UserRole.FARM_OWNER
          },
          {
            id: 'admin-1', 
            email: 'admin@crops.ai',
            password: 'Admin123!',
            name: 'Admin User',
            role: UserRole.ADMIN
          }
        ]

        // Check demo users first
        const demoUser = demoUsers.find(user => user.email === credentials.email)
        if (demoUser && demoUser.password === credentials.password) {
          return {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
            role: demoUser.role
          }
        }

        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user || !user.passwordHash) {
            return null
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash)
          if (!isValidPassword) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as UserRole
          }
        } catch (error) {
          console.error('Database authentication error:', error)
          // If database fails, only demo users work
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account) {
        // First sign in
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Only allow credentials provider for now
      return account?.provider === 'credentials'
    }
  },
  pages: {
    signIn: '/login',
    error: '/login?error=true'
  },
  secret: process.env.NEXTAUTH_SECRET
}

// Types for extending NextAuth
declare module 'next-auth' {
  interface User {
    role: UserRole
  }
  
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: UserRole
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    id: string
  }
}