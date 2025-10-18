import { prisma } from '../prisma'

export interface Template {
  id: string
  name: string
  description: string
  category: string
  cropType?: string
  seasonality?: string
  steps: any[]
  variables: any[]
  metadata?: any
  isPublic?: boolean
  tags?: string[]
  createdAt?: Date
  updatedAt?: Date
}

export interface TemplateInstance {
  id: string
  templateId: string
  farmId: string
  fieldId?: string
  userId: string
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  variables: any
  currentStep: number
  completedSteps: any[]
  createdAt: Date
  updatedAt: Date
}

export class TemplateManager {
  static async createTemplate(
    userId: string,
    template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Template> {
    const dbTemplate = await prisma.farmTemplate.create({
      data: {
        name: template.name,
        description: template.description,
        category: template.category,
        cropType: template.cropType || null,
        seasonality: template.seasonality || null,
        steps: template.steps,
        variables: template.variables,
        metadata: template.metadata || {},
        isPublic: template.isPublic || false,
        tags: template.tags || [],
        createdById: userId
      }
    })

    return this.mapToTemplate(dbTemplate)
  }

  static async getTemplates(filters?: any): Promise<Template[]> {
    const where: any = {}
    
    if (filters?.category) where.category = filters.category
    if (filters?.cropType) where.cropType = filters.cropType
    if (filters?.isPublic !== undefined) where.isPublic = filters.isPublic
    if (filters?.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags }
    }

    const templates = await prisma.farmTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return templates.map(this.mapToTemplate)
  }

  static async getTemplate(templateId: string, userId: string): Promise<Template | null> {
    const template = await prisma.farmTemplate.findFirst({
      where: {
        id: templateId,
        OR: [
          { createdById: userId },
          { isPublic: true }
        ]
      }
    })

    return template ? this.mapToTemplate(template) : null
  }

  static async createInstance(
    templateId: string,
    farmId: string,
    fieldId: string | undefined,
    variables: any,
    userId: string
  ): Promise<TemplateInstance> {
    // Verify template exists and user has access
    const template = await this.getTemplate(templateId, userId)
    if (!template) {
      throw new Error('Template not found or access denied')
    }

    this.validateVariables(template.variables, variables)

    const instance = await prisma.templateInstance.create({
      data: {
        templateId,
        farmId,
        fieldId: fieldId || null,
        userId,
        status: 'draft',
        variables,
        currentStep: 0,
        completedSteps: []
      }
    })

    return this.mapToTemplateInstance(instance)
  }

  static async startInstance(instanceId: string, userId: string): Promise<TemplateInstance> {
    const instance = await prisma.templateInstance.findFirst({
      where: { id: instanceId, userId }
    })

    if (!instance) {
      throw new Error('Template instance not found')
    }

    const updatedInstance = await prisma.templateInstance.update({
      where: { id: instanceId },
      data: { 
        status: 'active',
        updatedAt: new Date()
      }
    })

    return this.mapToTemplateInstance(updatedInstance)
  }

  static async completeStep(
    instanceId: string,
    stepId: string,
    userId: string,
    results?: any,
    notes?: string
  ): Promise<TemplateInstance> {
    const instance = await prisma.templateInstance.findFirst({
      where: { id: instanceId, userId }
    })

    if (!instance) {
      throw new Error('Template instance not found')
    }

    const completedSteps = [...(instance.completedSteps as any[]), {
      stepId,
      completedAt: new Date(),
      results,
      notes
    }]

    const updatedInstance = await prisma.templateInstance.update({
      where: { id: instanceId },
      data: {
        completedSteps,
        currentStep: instance.currentStep + 1,
        updatedAt: new Date()
      }
    })

    return this.mapToTemplateInstance(updatedInstance)
  }

  static async getFarmInstances(
    farmId: string,
    userId: string,
    status?: string
  ): Promise<TemplateInstance[]> {
    const where: any = { farmId, userId }
    if (status) where.status = status

    const instances = await prisma.templateInstance.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return instances.map(this.mapToTemplateInstance)
  }

  static async getBuiltInTemplates(): Promise<Template[]> {
    const templates = await prisma.farmTemplate.findMany({
      where: { isPublic: true },
      orderBy: { name: 'asc' }
    })

    return templates.map(this.mapToTemplate)
  }

  private static validateVariables(templateVariables: any[], instanceVariables: any): void {
    for (const templateVar of templateVariables) {
      if (templateVar.required && !(templateVar.name in instanceVariables)) {
        throw new Error(`Required variable '${templateVar.name}' is missing`)
      }

      if (templateVar.name in instanceVariables) {
        const value = instanceVariables[templateVar.name]
        
        switch (templateVar.type) {
          case 'number':
            if (typeof value !== 'number') {
              throw new Error(`Variable '${templateVar.name}' must be a number`)
            }
            break
          case 'boolean':
            if (typeof value !== 'boolean') {
              throw new Error(`Variable '${templateVar.name}' must be a boolean`)
            }
            break
          case 'date':
            if (!(value instanceof Date) && !Date.parse(value)) {
              throw new Error(`Variable '${templateVar.name}' must be a valid date`)
            }
            break
          case 'select':
            if (templateVar.options && !templateVar.options.includes(value)) {
              throw new Error(`Variable '${templateVar.name}' must be one of: ${templateVar.options.join(', ')}`)
            }
            break
        }
      }
    }
  }

  private static mapToTemplate(data: any): Template {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      cropType: data.cropType,
      seasonality: data.seasonality,
      steps: data.steps,
      variables: data.variables,
      metadata: data.metadata,
      isPublic: data.isPublic,
      tags: data.tags,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    }
  }

  private static mapToTemplateInstance(data: any): TemplateInstance {
    return {
      id: data.id,
      templateId: data.templateId,
      farmId: data.farmId,
      fieldId: data.fieldId,
      userId: data.userId,
      status: data.status,
      variables: data.variables,
      currentStep: data.currentStep,
      completedSteps: data.completedSteps,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    }
  }
}

export default TemplateManager