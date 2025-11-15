import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '../../../../lib/auth/server'

export async function GET(request: NextRequest) {
  try {
    console.log('=== AUTH STATUS DEBUG ===')
    
    const authHeader = request.headers.get('Authorization')
    const cookies = request.cookies.getAll()
    const authCookies = cookies.filter(c => c.name.includes('supabase'))
    
    console.log('Request headers:', Object.fromEntries(request.headers.entries()))
    console.log('Auth header:', authHeader)
    console.log('Cookies:', cookies.length, authCookies.map(c => c.name))
    
    const user = await getAuthenticatedUser(request)
    
    return NextResponse.json({
      authenticated: !!user,
      user: user ? {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      } : null,
      hasAuthHeader: !!authHeader,
      hasCookies: authCookies.length > 0,
      cookieNames: authCookies.map(c => c.name),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Auth status error:', error)
    return NextResponse.json({
      authenticated: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
}