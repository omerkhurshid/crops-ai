import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '../../../../lib/auth/server'
import { prisma } from '../../../../lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { issue, location, timestamp } = await request.json()

    if (!issue) {
      return NextResponse.json({ error: 'Issue description is required' }, { status: 400 })
    }

    // Create the issue record
    const fieldIssue = await prisma.fieldIssue.create({
      data: {
        userId: user.id,
        issue: issue,
        location: location || null,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        status: 'open',
        priority: 'medium'
      }
    })

    return NextResponse.json({
      success: true,
      issueId: fieldIssue.id
    })

  } catch (error) {
    console.error('Error creating field issue:', error)
    return NextResponse.json(
      { error: 'Failed to create issue report' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'open'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where = {
      userId: user.id,
      ...(status && { status })
    }

    const [issues, total] = await Promise.all([
      prisma.fieldIssue.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.fieldIssue.count({ where })
    ])

    return NextResponse.json({
      issues,
      total,
      hasMore: offset + limit < total
    })

  } catch (error) {
    console.error('Error fetching field issues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch issues' },
      { status: 500 }
    )
  }
}