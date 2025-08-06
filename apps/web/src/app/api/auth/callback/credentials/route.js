import { NextRequest } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Demo users
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

    const user = demoUsers.find(u => u.email === email && u.password === password)

    if (!user) {
      return Response.json({ url: 'https://crops-ai-gray.vercel.app/api/auth/error?error=CredentialsSignin' }, { status: 401 })
    }

    // In a real implementation, set a session cookie here
    // For now, just return success
    return Response.json({ url: 'https://crops-ai-gray.vercel.app/dashboard' })
  } catch (error) {
    return Response.json({ 
      url: 'https://crops-ai-gray.vercel.app/api/auth/error?error=Configuration' 
    }, { status: 500 })
  }
}