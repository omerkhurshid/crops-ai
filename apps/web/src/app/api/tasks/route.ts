import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '../../../lib/auth/server'
import { prisma } from '../../../lib/prisma'
import { z } from 'zod'
import { rateLimitWithFallback } from '../../../lib/rate-limit'
const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  category: z.string().optional(),
  dueDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  farmId: z.string().optional(),
  fieldId: z.string().optional(),
  cropId: z.string().optional(),
  tags: z.array(z.string()).default([])
})
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
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const farmId = searchParams.get('farmId')
    const status = searchParams.get('status')
    // Build where clause
    const where: any = {
      userId: user.id
    }
    if (farmId) {
      where.farmId = farmId
    }
    if (status && status !== 'all') {
      where.status = status
    }
    const tasks = await prisma.task.findMany({
      where,
      include: {
        farm: {
          select: { name: true }
        },
        field: {
          select: { name: true }
        },
        crop: {
          select: { cropType: true, variety: true }
        }
      },
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { dueDate: 'asc' }
      ]
    })
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}
export async function POST(request: NextRequest) {
  // Apply rate limiting for write operations
  const { success, headers } = await rateLimitWithFallback(request, 'write')
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
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const data = taskSchema.parse(body)
    // Get user's first farm if no farmId provided
    let farmId = data.farmId
    if (!farmId) {
      const farm = await prisma.farm.findFirst({
        where: { ownerId: user.id }
      })
      if (farm) {
        farmId = farm.id
      }
    }
    if (!farmId) {
      return NextResponse.json(
        { error: 'No farm found. Please create a farm first.' },
        { status: 400 }
      )
    }
    const task = await prisma.task.create({
      data: {
        ...data,
        farmId,
        userId: user.id,
        status: 'pending'
      },
      include: {
        farm: {
          select: { name: true }
        },
        field: {
          select: { name: true }
        },
        crop: {
          select: { cropType: true, variety: true }
        }
      }
    })
    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}