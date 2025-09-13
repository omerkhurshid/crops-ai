import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../lib/auth/session'
import { prisma } from '../../../lib/prisma'
import { rateLimitWithFallback } from '../../../lib/rate-limit'

export async function GET(request: NextRequest) {
  // Apply rate limiting for API endpoints
  const { success, headers } = await rateLimitWithFallback(request, 'api')
  
  if (!success) {
    return new Response('Too Many Requests. Please try again later.', {
      status: 429,
      headers: {
        ...headers,
        'Retry-After': headers['X-RateLimit-Reset'],
        'Content-Type': 'text/plain',
      },
    })
  }

  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const farmId = searchParams.get('farmId')
    const limit = searchParams.get('limit')

    if (!farmId) {
      return NextResponse.json({ error: 'farmId is required' }, { status: 400 })
    }

    // Fetch recommendations from the database
    const recommendations = await prisma.recommendation.findMany({
      where: {
        field: {
          farm: {
            id: farmId,
            ownerId: user.id
          }
        },
        isCompleted: false
      },
      include: {
        field: {
          select: { name: true }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ],
      take: limit ? parseInt(limit) : undefined
    })

    return NextResponse.json(recommendations)
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}