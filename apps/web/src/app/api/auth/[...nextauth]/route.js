import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          console.log('=== NextAuth Authorize Debug ===')
          console.log('Credentials received:', { 
            email: credentials?.email, 
            hasPassword: !!credentials?.password,
            passwordLength: credentials?.password?.length,
            secret: !!process.env.NEXTAUTH_SECRET,
            url: process.env.NEXTAUTH_URL,
            nodeEnv: process.env.NODE_ENV
          })
          
          if (!credentials?.email || !credentials?.password) {
            console.log('❌ Missing credentials - returning null')
            return null
          }

          // Demo users only for now
          const demoUsers = [
            {
              id: 'demo-1',
              email: 'demo@crops.ai',
              password: 'Demo123!',
              name: 'Demo User',
              role: 'FARM_OWNER'
            },
            {
              id: 'admin-1',
              email: 'admin@crops.ai',
              password: 'Admin123!',
              name: 'Admin User',
              role: 'ADMIN'
            }
          ]

          console.log('🔍 Checking against demo users:', demoUsers.map(u => ({ email: u.email, id: u.id })))

          // Check demo users
          const demoUser = demoUsers.find(user => {
            const emailMatch = user.email === credentials.email
            const passwordMatch = user.password === credentials.password
            console.log(`Checking user ${user.email}: email=${emailMatch}, password=${passwordMatch}`)
            return emailMatch && passwordMatch
          })

          if (demoUser) {
            const userResult = {
              id: demoUser.id,
              email: demoUser.email,
              name: demoUser.name,
              role: demoUser.role
            }
            console.log('✅ Demo user authenticated successfully:', userResult)
            return userResult
          }

          console.log('❌ Authentication failed for:', credentials.email)
          console.log('Available demo emails:', demoUsers.map(u => u.email))
          return null

        } catch (error) {
          console.error('🚨 Error in authorize function:', error)
          console.error('Error stack:', error.stack)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET || 'crops-ai-dev-secret-key-2024'
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      try {
        console.log('=== JWT Callback Debug ===')
        console.log('JWT callback called with:', { 
          hasUser: !!user, 
          hasToken: !!token,
          hasAccount: !!account,
          userEmail: user?.email,
          tokenEmail: token?.email
        })
        
        if (user) {
          console.log('✅ Adding user data to token:', { id: user.id, email: user.email, role: user.role })
          token.role = user.role
          token.id = user.id
        }
        
        console.log('JWT token result:', { 
          id: token.id, 
          email: token.email, 
          role: token.role 
        })
        return token
      } catch (error) {
        console.error('🚨 Error in JWT callback:', error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        console.log('=== Session Callback Debug ===')
        console.log('Session callback called with:', { 
          hasSession: !!session,
          hasToken: !!token,
          tokenId: token?.id,
          tokenRole: token?.role,
          sessionUserEmail: session?.user?.email
        })
        
        if (token) {
          session.user.id = token.id
          session.user.role = token.role
          console.log('✅ Session updated with token data')
        }
        
        console.log('Final session result:', {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role
        })
        return session
      } catch (error) {
        console.error('🚨 Error in session callback:', error)
        return session
      }
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('🎉 NextAuth signIn event:', { user, account, profile, isNewUser })
    },
    async signOut({ token, session }) {
      console.log('👋 NextAuth signOut event:', { token, session })
    },
    async session({ session, token }) {
      console.log('📋 NextAuth session event:', { session, token })
    },
    async createUser({ user }) {
      console.log('👤 NextAuth createUser event:', { user })
    }
  },
  logger: {
    error(code, metadata) {
      console.error('🚨 NextAuth Error:', code, metadata)
    },
    warn(code) {
      console.warn('⚠️  NextAuth Warning:', code)
    },
    debug(code, metadata) {
      console.log('🐛 NextAuth Debug:', code, metadata)
    }
  },
  secret: process.env.NEXTAUTH_SECRET || 'crops-ai-dev-secret-key-2024',
  debug: true
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }