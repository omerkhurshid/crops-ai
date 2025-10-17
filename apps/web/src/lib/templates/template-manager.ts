/**
 * Template Management System
 * Real implementation for farm operation templates and automation
 */

import { prisma } from '../prisma'
import { AuditLogger } from '../audit-logger'

export interface TemplateVariable {
  name: string
  type: 'string' | 'number' | 'date' | 'boolean' | 'select'
  defaultValue?: any
  options?: string[] // For select type
  required: boolean
  description?: string
}

export interface TemplateStep {
  id: string
  order: number
  title: string
  description: string
  type: 'task' | 'decision' | 'measurement' | 'application'
  variables?: TemplateVariable[]
  conditions?: any // JSON conditions for when this step applies
  estimatedDuration?: number // in minutes
}

export interface Template {
  id: string
  name: string
  description: string
  category: 'planting' | 'harvesting' | 'irrigation' | 'fertilization' | 'pest_control' | 'maintenance' | 'custom'
  cropType?: string
  seasonality?: string
  steps: TemplateStep[]
  variables: TemplateVariable[]
  metadata: {
    createdBy: string
    createdAt: Date
    lastModified: Date
    version: string
    isPublic: boolean
    tags: string[]
  }
}

export interface TemplateInstance {
  id: string
  templateId: string
  farmId: string
  fieldId?: string
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  variables: Record<string, any>
  currentStep: number
  startedAt?: Date
  completedAt?: Date
  completedSteps: Array<{
    stepId: string
    completedAt: Date
    results?: any
    notes?: string
  }>
}

export class TemplateManager {
  /**
   * Create a new template
   */
  static async createTemplate(
    userId: string,
    template: Omit<Template, 'id' | 'metadata'>
  ): Promise<Template> {
    try {
      const templateData = await prisma.farmTemplate.create({
        data: {
          name: template.name,
          description: template.description,
          category: template.category,
          cropType: template.cropType,
          seasonality: template.seasonality,
          steps: template.steps,
          variables: template.variables,
          createdById: userId,
          version: '1.0.0',
          isPublic: false,
          tags: []
        }
      })

      await AuditLogger.logEvent({
        userId,
        action: 'template_create',
        resource: 'farm_template',
        resourceId: templateData.id,
        newValues: {
          name: template.name,
          category: template.category,
          stepsCount: template.steps.length
        }
      })

      return this.mapToTemplate(templateData)
    } catch (error) {
      console.error('Error creating template:', error)
      throw new Error('Failed to create template')
    }
  }

  /**
   * Get templates for a user or public templates
   */
  static async getTemplates(
    userId: string,
    filters?: {
      category?: string
      cropType?: string
      isPublic?: boolean
      tags?: string[]
    }
  ): Promise<Template[]> {
    try {
      const where: any = {
        OR: [
          { createdById: userId },
          { isPublic: true }
        ]
      }

      if (filters?.category) {
        where.category = filters.category
      }

      if (filters?.cropType) {
        where.cropType = filters.cropType
      }

      if (filters?.isPublic !== undefined) {
        where.isPublic = filters.isPublic
      }

      if (filters?.tags && filters.tags.length > 0) {
        where.tags = {
          hasSome: filters.tags
        }
      }

      const templates = await prisma.farmTemplate.findMany({
        where,
        orderBy: [
          { isPublic: 'desc' },
          { createdAt: 'desc' }
        ]
      })

      return templates.map(this.mapToTemplate)
    } catch (error) {
      console.error('Error fetching templates:', error)
      return []
    }
  }

  /**
   * Get a specific template by ID
   */
  static async getTemplate(templateId: string, userId: string): Promise<Template | null> {
    try {
      const template = await prisma.farmTemplate.findFirst({
        where: {
          id: templateId,
          OR: [
            { createdById: userId },
            { isPublic: true }
          ]
        }
      })

      if (!template) return null

      return this.mapToTemplate(template)
    } catch (error) {
      console.error('Error fetching template:', error)
      return null
    }
  }

  /**
   * Create a template instance for execution
   */
  static async createInstance(
    templateId: string,
    farmId: string,
    userId: string,
    variables: Record<string, any>,
    fieldId?: string
  ): Promise<TemplateInstance> {
    try {
      const template = await this.getTemplate(templateId, userId)
      if (!template) {
        throw new Error('Template not found')
      }

      // Validate variables
      this.validateVariables(template.variables, variables)

      const instance = await prisma.templateInstance.create({
        data: {
          templateId,
          farmId,
          fieldId,
          userId,
          status: 'draft',
          variables,
          currentStep: 0,
          completedSteps: []
        }
      })

      await AuditLogger.logEvent({
        userId,
        action: 'template_instance_create',
        resource: 'template_instance',
        resourceId: instance.id,
        newValues: {
          templateId,
          farmId,
          fieldId,
          variableCount: Object.keys(variables).length
        }
      })

      return this.mapToTemplateInstance(instance)
    } catch (error) {
      console.error('Error creating template instance:', error)
      throw error
    }
  }

  /**
   * Start executing a template instance
   */
  static async startInstance(instanceId: string, userId: string): Promise<TemplateInstance> {
    try {
      const instance = await prisma.templateInstance.update({
        where: { 
          id: instanceId,
          userId 
        },
        data: {
          status: 'active',
          startedAt: new Date()
        }
      })

      await AuditLogger.logEvent({
        userId,
        action: 'template_instance_start',
        resource: 'template_instance',
        resourceId: instanceId
      })

      return this.mapToTemplateInstance(instance)
    } catch (error) {
      console.error('Error starting template instance:', error)
      throw new Error('Failed to start template instance')
    }
  }

  /**
   * Complete a step in a template instance
   */
  static async completeStep(
    instanceId: string,
    stepId: string,
    userId: string,
    results?: any,
    notes?: string
  ): Promise<TemplateInstance> {
    try {
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

      const template = await this.getTemplate(instance.templateId, userId)
      const nextStep = instance.currentStep + 1
      const isCompleted = nextStep >= (template?.steps.length || 0)

      const updatedInstance = await prisma.templateInstance.update({
        where: { id: instanceId },
        data: {
          completedSteps,
          currentStep: nextStep,
          status: isCompleted ? 'completed' : 'active',
          completedAt: isCompleted ? new Date() : null
        }
      })

      await AuditLogger.logEvent({
        userId,
        action: 'template_step_complete',
        resource: 'template_instance',
        resourceId: instanceId,
        newValues: {
          stepId,
          stepNumber: instance.currentStep + 1,
          isCompleted,
          hasResults: !!results
        }
      })

      return this.mapToTemplateInstance(updatedInstance)
    } catch (error) {
      console.error('Error completing template step:', error)
      throw error
    }
  }

  /**
   * Get template instances for a farm
   */
  static async getFarmInstances(
    farmId: string,
    userId: string,
    status?: string
  ): Promise<TemplateInstance[]> {
    try {
      const where: any = {
        farmId,
        userId
      }

      if (status) {
        where.status = status
      }

      const instances = await prisma.templateInstance.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      })

      return instances.map(this.mapToTemplateInstance)
    } catch (error) {
      console.error('Error fetching farm instances:', error)
      return []
    }
  }

  /**
   * Create default templates for common farm operations
   */
  static async createDefaultTemplates(userId: string): Promise<Template[]> {
    const defaultTemplates = [
      {
        name: 'Basic Corn Planting',
        description: 'Standard corn planting procedure for optimal yield',
        category: 'planting' as const,
        cropType: 'corn',
        seasonality: 'spring',
        variables: [
          {
            name: 'plantingRate',
            type: 'number' as const,
            defaultValue: 32000,
            required: true,
            description: 'Seeds per acre'
          },
          {
            name: 'rowSpacing',
            type: 'number' as const,
            defaultValue: 30,
            required: true,
            description: 'Row spacing in inches'
          },
          {
            name: 'plantingDepth',
            type: 'number' as const,
            defaultValue: 2,
            required: true,
            description: 'Planting depth in inches'
          }
        ],
        steps: [
          {
            id: 'soil-prep',
            order: 1,
            title: 'Soil Preparation',
            description: 'Prepare soil for planting',
            type: 'task',
            estimatedDuration: 120
          },
          {
            id: 'calibrate-planter',
            order: 2,
            title: 'Calibrate Planter',
            description: 'Set planter for correct rate and depth',
            type: 'task',
            estimatedDuration: 30
          },
          {
            id: 'plant-field',
            order: 3,
            title: 'Plant Field',
            description: 'Execute planting operation',
            type: 'task',
            estimatedDuration: 240
          },
          {
            id: 'quality-check',
            order: 4,
            title: 'Quality Check',
            description: 'Verify planting quality and emergence',
            type: 'measurement',
            estimatedDuration: 45
          }
        ]
      },
      {
        name: 'Field Irrigation Schedule',
        description: 'Systematic irrigation planning and execution',
        category: 'irrigation' as const,
        seasonality: 'summer',
        variables: [
          {
            name: 'waterAmount',
            type: 'number' as const,
            defaultValue: 1.0,
            required: true,
            description: 'Inches of water to apply'
          },
          {
            name: 'irrigationType',
            type: 'select' as const,
            options: ['center_pivot', 'drip', 'sprinkler', 'flood'],
            defaultValue: 'center_pivot',
            required: true,
            description: 'Type of irrigation system'
          }
        ],
        steps: [
          {
            id: 'soil-moisture-check',
            order: 1,
            title: 'Check Soil Moisture',
            description: 'Measure current soil moisture levels',
            type: 'measurement',
            estimatedDuration: 30
          },
          {
            id: 'calculate-needs',
            order: 2,
            title: 'Calculate Water Needs',
            description: 'Determine irrigation requirements',
            type: 'decision',
            estimatedDuration: 15
          },
          {
            id: 'setup-system',
            order: 3,
            title: 'Setup Irrigation System',
            description: 'Prepare and configure irrigation equipment',
            type: 'task',
            estimatedDuration: 45
          },
          {
            id: 'apply-water',
            order: 4,
            title: 'Apply Irrigation',
            description: 'Execute irrigation application',
            type: 'application',
            estimatedDuration: 180
          },
          {
            id: 'verify-coverage',
            order: 5,
            title: 'Verify Coverage',
            description: 'Check irrigation uniformity and coverage',
            type: 'measurement',
            estimatedDuration: 30
          }
        ]
      }
    ]

    const createdTemplates: Template[] = []

    for (const templateData of defaultTemplates) {
      try {
        const template = await this.createTemplate(userId, templateData)
        createdTemplates.push(template)
      } catch (error) {
        console.error('Error creating default template:', templateData.name, error)
      }
    }

    return createdTemplates
  }

  /**
   * Validate template variables
   */
  private static validateVariables(
    templateVars: TemplateVariable[],
    providedVars: Record<string, any>
  ): void {
    const errors: string[] = []

    templateVars.forEach(templateVar => {
      const value = providedVars[templateVar.name]

      // Check required variables
      if (templateVar.required && (value === undefined || value === null)) {
        errors.push(`Required variable '${templateVar.name}' is missing`)
        return
      }

      // Skip validation if not provided and not required
      if (value === undefined || value === null) return

      // Type validation
      switch (templateVar.type) {
        case 'number':
          if (typeof value !== 'number' || isNaN(value)) {
            errors.push(`Variable '${templateVar.name}' must be a number`)
          }
          break
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`Variable '${templateVar.name}' must be a string`)
          }
          break
        case 'boolean':
          if (typeof value !== 'boolean') {
            errors.push(`Variable '${templateVar.name}' must be a boolean`)
          }
          break
        case 'select':
          if (templateVar.options && !templateVar.options.includes(value)) {
            errors.push(`Variable '${templateVar.name}' must be one of: ${templateVar.options.join(', ')}`)
          }
          break
        case 'date':
          if (!(value instanceof Date) && isNaN(Date.parse(value))) {
            errors.push(`Variable '${templateVar.name}' must be a valid date`)
          }
          break
      }
    })

    if (errors.length > 0) {
      throw new Error(`Variable validation failed: ${errors.join(', ')}`)
    }
  }

  /**
   * Map database record to Template interface
   */
  private static mapToTemplate(dbTemplate: any): Template {
    return {
      id: dbTemplate.id,
      name: dbTemplate.name,
      description: dbTemplate.description,
      category: dbTemplate.category,
      cropType: dbTemplate.cropType,
      seasonality: dbTemplate.seasonality,
      steps: dbTemplate.steps || [],
      variables: dbTemplate.variables || [],
      metadata: {
        createdBy: dbTemplate.createdById,
        createdAt: dbTemplate.createdAt,
        lastModified: dbTemplate.updatedAt,
        version: dbTemplate.version || '1.0.0',
        isPublic: dbTemplate.isPublic || false,
        tags: dbTemplate.tags || []
      }
    }
  }

  /**
   * Map database record to TemplateInstance interface
   */
  private static mapToTemplateInstance(dbInstance: any): TemplateInstance {
    return {
      id: dbInstance.id,
      templateId: dbInstance.templateId,
      farmId: dbInstance.farmId,
      fieldId: dbInstance.fieldId,
      status: dbInstance.status,
      variables: dbInstance.variables || {},
      currentStep: dbInstance.currentStep || 0,
      startedAt: dbInstance.startedAt,
      completedAt: dbInstance.completedAt,
      completedSteps: dbInstance.completedSteps || []
    }
  }
}