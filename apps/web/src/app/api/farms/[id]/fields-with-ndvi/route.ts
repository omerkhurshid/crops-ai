import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth/session'
import { prisma } from '../../../../../lib/prisma'
import { rateLimitWithFallback } from '../../../../../lib/rate-limit'
import { Logger } from '@crops-ai/shared'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

  const farmId = params.id
  let user: any = null
  
  try {
    user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the user owns this farm
    const farm = await prisma.farm.findFirst({
      where: {
        id: farmId,
        ownerId: user.id
      }
    })

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 })
    }

    // Fetch fields with their latest satellite data
    const fields = await prisma.field.findMany({
      where: {
        farmId: farmId
      },
      include: {
        satelliteData: {
          orderBy: {
            captureDate: 'desc'
          },
          take: 2 // Get last 2 to calculate change
        },
        crops: {
          where: {
            status: {
              not: 'HARVESTED'
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })

    // Transform the data to include NDVI and stress info
    const fieldsWithNDVI = fields.map(field => {
      const latestData = field.satelliteData[0]
      const previousData = field.satelliteData[1]
      
      let ndviChange = undefined
      if (latestData && previousData && previousData.ndvi) {
        ndviChange = ((latestData.ndvi - previousData.ndvi) / previousData.ndvi) * 100
      }

      return {
        id: field.id,
        name: field.name,
        area: field.area,
        color: field.color || '#88dd44',
        cropType: field.crops[0]?.cropType || field.cropType,
        status: field.status || 'active',
        ndvi: latestData?.ndvi,
        ndviChange: ndviChange,
        stressLevel: latestData?.stressLevel?.toLowerCase() || 'none',
        lastAnalysisDate: latestData?.captureDate,
        // Mock additional data - in production these would come from sensors
        soilMoisture: latestData ? Math.round(65 + Math.random() * 20) : undefined,
        temperature: latestData ? Math.round(18 + Math.random() * 10) : undefined
      }
    })

    return NextResponse.json(fieldsWithNDVI)
  } catch (error) {
    Logger.error('Error fetching fields with NDVI', error, { farmId, userId: user?.id })
    return NextResponse.json(
      { error: 'Failed to fetch field data' },
      { status: 500 }
    )
  }
}