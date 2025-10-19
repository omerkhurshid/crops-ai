import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'
import CredentialsProvider from 'next-auth/providers/credentials'
import { UserRole } from '@prisma/client'

// Simple logger implementation
const Logger = {
  error: (message: string, error?: any) => {
    console.error(message, error)
  },
  info: (message: string, data?: any) => {

  },
  warn: (message: string, data?: any) => {

  }
}
import bcrypt from 'bcryptjs'

// Initialize config only on server-side to prevent client-side environment validation
let config: any = null;
if (typeof window === 'undefined') {
  const { getConfig } = require('./config/environment');
  config = getConfig();
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

        // Demo authentication removed for production

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
          Logger.error('Database authentication error', error)
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
  secret: config.NEXTAUTH_SECRET,
  debug: config.NODE_ENV === 'development'
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