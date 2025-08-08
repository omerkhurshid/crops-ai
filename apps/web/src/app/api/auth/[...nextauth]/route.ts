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
            passwordLength: credentials?.password?.length
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
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('✅ Adding user data to token:', { id: user.id, email: user.email, role: user.role })
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        console.log('✅ Session updated with token data')
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  secret: process.env.NEXTAUTH_SECRET || 'crops-ai-dev-secret-key-2024',
  debug: true
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }