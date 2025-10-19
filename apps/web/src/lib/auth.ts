import { NextAuthOptions } from 'next-auth'
import { prisma } from './prisma'
import CredentialsProvider from 'next-auth/providers/credentials'
import { UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Authentication logger following codebase patterns
const AuthLogger = {
  info: (message: string, data?: any) => {
    console.log(`[AUTH] ${message}`, data || '')
  },
  error: (message: string, error?: any) => {
    console.error(`[AUTH] ${message}`, error || '')
  },
  warn: (message: string, data?: any) => {
    console.warn(`[AUTH] ${message}`, data || '')
  }
}

export const authOptions: NextAuthOptions = {
  // Using JWT strategy for better performance and simpler setup
  // Remove adapter to use JWT sessions instead of database sessions
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          AuthLogger.warn('Authentication attempt with missing credentials')
          return null
        }

        try {
          AuthLogger.info('Authentication attempt started', { email: credentials.email })
          
          // Find user by email
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user) {
            AuthLogger.warn('Authentication failed - user not found', { email: credentials.email })
            return null
          }

          // Check if user has a password hash
          if (!user.passwordHash) {
            AuthLogger.warn('Authentication failed - user has no password hash', { 
              email: credentials.email,
              userId: user.id 
            })
            return null
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash)
          if (!isValidPassword) {
            AuthLogger.warn('Authentication failed - invalid password', { 
              email: credentials.email,
              userId: user.id 
            })
            return null
          }

          AuthLogger.info('Authentication successful', { 
            email: credentials.email,
            userId: user.id,
            role: user.role 
          })
          
          // Return user object for NextAuth JWT
          return {
            id: user.id,
            email: user.email,
            name: user.name || user.email,
            role: user.role as UserRole
          }
        } catch (error) {
          AuthLogger.error('Database authentication error', error)
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
    signIn: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  
  // Enhanced logging for consistency with codebase patterns
  logger: {
    error: (code, metadata) => {
      AuthLogger.error(`NextAuth Error [${code}]`, metadata)
    },
    warn: (code) => {
      AuthLogger.warn(`NextAuth Warning [${code}]`)
    },
    debug: (code, metadata) => {
      if (process.env.NODE_ENV === 'development') {
        AuthLogger.info(`NextAuth Debug [${code}]`, metadata)
      }
    }
  }
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