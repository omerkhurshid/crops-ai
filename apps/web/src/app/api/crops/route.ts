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
    const year = searchParams.get('year')

    if (!farmId) {
      return NextResponse.json({ error: 'farmId is required' }, { status: 400 })
    }

    // Build where clause
    const where: any = {
      field: {
        farm: {
          id: farmId,
          ownerId: user.id
        }
      }
    }

    // Filter by year if provided
    if (year) {
      const yearNum = parseInt(year)
      where.OR = [
        {
          plantingDate: {
            gte: new Date(yearNum, 0, 1),
            lt: new Date(yearNum + 1, 0, 1)
          }
        },
        {
          expectedHarvestDate: {
            gte: new Date(yearNum, 0, 1),
            lt: new Date(yearNum + 1, 0, 1)
          }
        }
      ]
    }

    const crops = await prisma.crop.findMany({
      where,
      include: {
        field: {
          select: { 
            name: true,
            area: true
          }
        }
      },
      orderBy: [
        { plantingDate: 'asc' }
      ]
    })

    return NextResponse.json(crops)
  } catch (error) {
    console.error('Error fetching crops:', error)
    return NextResponse.json(
      { error: 'Failed to fetch crops' },
      { status: 500 }
    )
  }
}