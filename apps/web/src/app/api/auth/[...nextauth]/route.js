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
        console.log('NextAuth authorize called with:', { 
          email: credentials?.email, 
          hasPassword: !!credentials?.password,
          secret: !!process.env.NEXTAUTH_SECRET,
          url: process.env.NEXTAUTH_URL
        })
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
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

        // Check demo users
        const demoUser = demoUsers.find(user => user.email === credentials.email)
        if (demoUser && demoUser.password === credentials.password) {
          console.log('Demo user authenticated successfully:', demoUser.email)
          return {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
            role: demoUser.role
          }
        }

        console.log('Authentication failed for:', credentials.email)
        return null
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
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
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