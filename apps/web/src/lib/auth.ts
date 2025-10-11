import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@crops-ai/database'
import CredentialsProvider from 'next-auth/providers/credentials'
import { UserRole } from '@crops-ai/shared'
import bcrypt from 'bcryptjs'

// Production safety check - prevent demo users in production
if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DEMO_USERS === 'true') {
  throw new Error('Demo users cannot be enabled in production!');
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any, // Type assertion to handle version compatibility
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

        // Demo mode - only enabled in development with explicit environment variables
        if (process.env.NODE_ENV === 'development' && process.env.ENABLE_DEMO_USERS === 'true') {
          // Demo users must be configured via environment variables
          const demoEmail = process.env.DEMO_USER_EMAIL
          const demoPassword = process.env.DEMO_USER_PASSWORD
          const adminEmail = process.env.DEMO_ADMIN_EMAIL
          const adminPassword = process.env.DEMO_ADMIN_PASSWORD
          
          // Only check demo users if all required env vars are set
          if (demoEmail && demoPassword && credentials.email === demoEmail && credentials.password === demoPassword) {
            return {
              id: 'demo-1',
              email: demoEmail,
              name: 'Demo Farmer',
              role: UserRole.FARM_OWNER
            }
          }
          
          if (adminEmail && adminPassword && credentials.email === adminEmail && credentials.password === adminPassword) {
            return {
              id: 'admin-1',
              email: adminEmail,
              name: 'Admin User',
              role: UserRole.ADMIN
            }
          }
        }

        // Try database authentication
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
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
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
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
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