import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '../../../../lib/auth/server'
import { prisma } from '../../../../lib/prisma'
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const { taskName, location, timestamp, status } = body
    if (!taskName) {
      return NextResponse.json({ error: 'Task name is required' }, { status: 400 })
    }
    // Create a quick task record - use first farm if available
    const userFarm = await prisma.farm.findFirst({
      where: { ownerId: user.id },
      select: { id: true }
    })
    const task = await prisma.task.create({
      data: {
        title: taskName,
        description: `Quick task completed from field mode${location ? ` at ${location}` : ''}`,
        userId: user.id,
        farmId: userFarm?.id || 'default', // Use first farm or default
        status: status || 'completed',
        priority: 'medium',
        dueDate: new Date(),
        completedAt: status === 'completed' ? (timestamp ? new Date(timestamp) : new Date()) : null
      }
    })
    return NextResponse.json({
      success: true,
      taskId: task.id
    })
  } catch (error) {
    console.error('Error creating quick task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}