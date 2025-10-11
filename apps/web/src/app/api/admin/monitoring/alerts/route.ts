import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../../lib/auth'
import { UserRole } from '@crops-ai/shared'
import { alertManager } from '../../../../../lib/alerting'
import { z } from 'zod'

const createAlertSchema = z.object({
  type: z.enum(['error', 'warning', 'info', 'critical']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  source: z.string().min(1).max(100),
  metadata: z.record(z.any()).optional()
})

// GET /api/admin/monitoring/alerts - Get recent alerts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const type = searchParams.get('type') as any

    const alerts = type 
      ? alertManager.getAlertsByType(type, limit)
      : alertManager.getRecentAlerts(limit)

    return NextResponse.json({
      alerts,
      total: alerts.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Failed to fetch alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

// POST /api/admin/monitoring/alerts - Create new alert
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createAlertSchema.parse(body)

    const alert = await alertManager.sendAlert(validatedData)

    return NextResponse.json({
      success: true,
      alert,
      message: 'Alert created and sent successfully'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid alert data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Failed to create alert:', error)
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/monitoring/alerts - Clear all alerts
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    alertManager.clearAlerts()

    return NextResponse.json({
      success: true,
      message: 'All alerts cleared successfully'
    })

  } catch (error) {
    console.error('Failed to clear alerts:', error)
    return NextResponse.json(
      { error: 'Failed to clear alerts' },
      { status: 500 }
    )
  }
}