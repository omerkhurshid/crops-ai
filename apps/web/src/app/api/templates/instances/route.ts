import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../lib/auth/session'
import { prisma } from '../../../../lib/prisma'
import { TemplateManager } from '../../../../lib/templates/template-manager'
import { z } from 'zod'

const createInstanceSchema = z.object({
  templateId: z.string(),
  farmId: z.string(),
  fieldId: z.string().optional(),
  variables: z.record(z.any())
})

const getInstancesSchema = z.object({
  farmId: z.string(),
  status: z.string().optional()
})

// GET /api/templates/instances
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    const { farmId, status } = getInstancesSchema.parse(params)

    // Verify farm ownership
    const farm = await prisma.farm.findFirst({
      where: {
        id: farmId,
        ownerId: user.id
      }
    })

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 })
    }

    const instances = await TemplateManager.getFarmInstances(farmId, user.id, status)

    return NextResponse.json({
      success: true,
      instances,
      count: instances.length
    })

  } catch (error) {
    console.error('Error fetching template instances:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid parameters', 
        details: error.errors 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch template instances' 
    }, { status: 500 })
  }
}

// POST /api/templates/instances
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { templateId, farmId, fieldId, variables } = createInstanceSchema.parse(body)

    // Verify farm ownership
    const farm = await prisma.farm.findFirst({
      where: {
        id: farmId,
        ownerId: user.id
      }
    })

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 })
    }

    // Verify field ownership if provided
    if (fieldId) {
      const field = await prisma.field.findFirst({
        where: {
          id: fieldId,
          farmId
        }
      })

      if (!field) {
        return NextResponse.json({ error: 'Field not found' }, { status: 404 })
      }
    }

    const instance = await TemplateManager.createInstance(
      templateId,
      farmId,
      fieldId,
      variables,
      user.id
    )

    return NextResponse.json({
      success: true,
      instance
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating template instance:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid instance data', 
        details: error.errors 
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to create template instance'
    }, { status: 500 })
  }
}