import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '../../../lib/auth/server'
import { TemplateManager } from '../../../lib/templates/template-manager'
import { z } from 'zod'
const createTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000),
  category: z.enum(['planting', 'harvesting', 'irrigation', 'fertilization', 'pest_control', 'maintenance', 'custom']),
  cropType: z.string().optional(),
  seasonality: z.string().optional(),
  steps: z.array(z.object({
    id: z.string(),
    order: z.number(),
    title: z.string(),
    description: z.string(),
    type: z.enum(['task', 'decision', 'measurement', 'application']),
    estimatedDuration: z.number().optional()
  })),
  variables: z.array(z.object({
    name: z.string(),
    type: z.enum(['string', 'number', 'date', 'boolean', 'select']),
    defaultValue: z.any().optional(),
    options: z.array(z.string()).optional(),
    required: z.boolean(),
    description: z.string().optional()
  }))
})
const getTemplatesSchema = z.object({
  category: z.string().optional(),
  cropType: z.string().optional(),
  isPublic: z.coerce.boolean().optional(),
  tags: z.string().optional() // Comma-separated tags
})
// GET /api/templates
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    const { category, cropType, isPublic, tags } = getTemplatesSchema.parse(params)
    const filters: any = {}
    if (category) filters.category = category
    if (cropType) filters.cropType = cropType
    if (isPublic !== undefined) filters.isPublic = isPublic
    if (tags) filters.tags = tags.split(',').map(tag => tag.trim())
    const templates = await TemplateManager.getTemplates(filters)
    return NextResponse.json({
      success: true,
      templates,
      count: templates.length
    })
  } catch (error) {
    console.error('Error fetching templates:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid parameters', 
        details: error.errors 
      }, { status: 400 })
    }
    return NextResponse.json({ 
      error: 'Failed to fetch templates' 
    }, { status: 500 })
  }
}
// POST /api/templates
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const templateData = createTemplateSchema.parse(body)
    const template = await TemplateManager.createTemplate(user.id, templateData)
    return NextResponse.json({
      success: true,
      template
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid template data', 
        details: error.errors 
      }, { status: 400 })
    }
    return NextResponse.json({ 
      error: 'Failed to create template' 
    }, { status: 500 })
  }
}