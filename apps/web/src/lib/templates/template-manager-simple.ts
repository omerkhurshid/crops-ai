/**
 * Simple Template Manager (Mock Implementation)
 * TODO: Implement full functionality when models are added
 */
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
    template: Omit<Template, 'id' | 'metadata'>
  ): Promise<Template> {
    return {
      id: 'mock-template-' + Date.now(),
      ...template,
      metadata: {}
    }
  }
  static async getTemplates(filters?: any): Promise<Template[]> {
    return []
  }
  static async getTemplate(templateId: string, userId: string): Promise<Template | null> {
    return null
  }
  static async createInstance(
    templateId: string,
    farmId: string,
    fieldId: string | undefined,
    variables: any,
    userId: string
  ): Promise<TemplateInstance> {
    return {
      id: 'mock-instance-' + Date.now(),
      templateId,
      farmId,
      fieldId,
      userId,
      status: 'draft',
      variables,
      currentStep: 0,
      completedSteps: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
  static async startInstance(instanceId: string, userId: string): Promise<TemplateInstance> {
    throw new Error('Template instances not implemented yet')
  }
  static async completeStep(
    instanceId: string,
    stepId: string,
    userId: string,
    results?: any,
    notes?: string
  ): Promise<TemplateInstance> {
    throw new Error('Template instances not implemented yet')
  }
  static async getFarmInstances(
    farmId: string,
    userId: string,
    status?: string
  ): Promise<TemplateInstance[]> {
    return []
  }
  static async getBuiltInTemplates(): Promise<Template[]> {
    return []
  }
  private static validateVariables(templateVariables: any[], instanceVariables: any): void {
    // Mock validation
  }
  private static mapToTemplate(data: any): Template {
    return data
  }
  private static mapToTemplateInstance(data: any): TemplateInstance {
    return data
  }
}
export default TemplateManager