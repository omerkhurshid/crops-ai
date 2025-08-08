import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    return Response.json(session)
  } catch (error) {
    console.error('Session endpoint error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}