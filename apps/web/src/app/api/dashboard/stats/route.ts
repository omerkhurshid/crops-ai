import { NextRequest } from 'next/server'
import { getCurrentUser } from '../../../../lib/auth/session'
import { createSuccessResponse, handleApiError, ValidationError } from '../../../../lib/api/errors'
import { apiMiddleware, withMethods } from '../../../../lib/api/middleware'
import { prisma } from '../../../../lib/prisma'

// GET /api/dashboard/stats
export const GET = apiMiddleware.protected(
  withMethods(['GET'], async (request: NextRequest) => {
    try {
      const user = await getCurrentUser()
      
      if (!user) {
        throw new ValidationError('User authentication required')
      }

      // Get user's farms and fields data
      const [farms, fields, recentActivity, weatherAlerts] = await Promise.all([
        // Get farms count and basic info
        prisma.farm.findMany({
          where: { ownerId: user.id },
          include: {
            fields: {
              select: {
                id: true,
                name: true,
                crop: true,
                size: true,
                isActive: true
              }
            }
          }
        }),
        
        // Get active fields count
        prisma.field.count({
          where: {
            farm: { ownerId: user.id },
            isActive: true
          }
        }),

        // Get recent activity (last 30 days)
        prisma.farm.findMany({
          where: { ownerId: user.id },
          include: {
            fields: {
              include: {
                satelliteData: {
                  where: {
                    captureDate: {
                      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    }
                  },
                  orderBy: { captureDate: 'desc' },
                  take: 5
                }
              }
            }
          },
          take: 5
        }),

        // Simulate weather alerts count (would be real API call)
        Promise.resolve(Math.floor(Math.random() * 3)) // 0-2 alerts
      ])

      // Calculate statistics
      const totalFarms = farms.length
      const activeFields = fields
      const totalFields = farms.reduce((sum, farm) => sum + farm.fields.length, 0)
      
      // Generate recent activity from satellite data and farm operations
      const activityItems = []
      
      // Add farm creation activities
      farms.forEach(farm => {
        if (farm.createdAt && farm.createdAt > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
          activityItems.push({
            id: `farm-created-${farm.id}`,
            type: 'farm_created',
            title: `Farm "${farm.name}" created`,
            description: `New farm added to your portfolio`,
            timestamp: farm.createdAt,
            farmId: farm.id,
            farmName: farm.name
          })
        }
      })

      // Add field activity from satellite data
      farms.forEach(farm => {
        farm.fields.forEach(field => {
          field.satelliteData?.forEach(data => {
            activityItems.push({
              id: `satellite-${data.id}`,
              type: 'satellite_analysis',
              title: `Health analysis for ${field.name}`,
              description: `NDVI: ${data.ndvi?.toFixed(3)} | Stress: ${data.stressLevel?.toLowerCase()}`,
              timestamp: data.captureDate,
              farmId: farm.id,
              farmName: farm.name,
              fieldId: field.id,
              fieldName: field.name
            })
          })
        })
      })

      // Sort activities by date and take most recent
      activityItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      const recentActivities = activityItems.slice(0, 5)

      // Calculate crop distribution
      const cropDistribution: Record<string, number> = {}
      farms.forEach(farm => {
        farm.fields.forEach(field => {
          if (field.crop) {
            cropDistribution[field.crop] = (cropDistribution[field.crop] || 0) + 1
          }
        })
      })

      // Calculate total farm area
      const totalArea = farms.reduce((sum, farm) => {
        return sum + farm.fields.reduce((fieldSum, field) => fieldSum + (field.size || 0), 0)
      }, 0)

      // Health score simulation (would be from actual satellite analysis)
      const avgHealthScore = totalFields > 0 ? 75 + Math.random() * 20 : 0

      const stats = {
        overview: {
          totalFarms,
          activeFields,
          totalFields,
          totalArea: Math.round(totalArea * 100) / 100, // hectares
          weatherAlerts,
          avgHealthScore: Math.round(avgHealthScore)
        },
        farms: farms.map(farm => ({
          id: farm.id,
          name: farm.name,
          description: farm.description,
          type: farm.type,
          fieldsCount: farm.fields.length,
          activeFieldsCount: farm.fields.filter(f => f.isActive).length,
          totalArea: Math.round(farm.fields.reduce((sum, field) => sum + (field.size || 0), 0) * 100) / 100,
          createdAt: farm.createdAt,
          crops: farm.fields.map(f => f.crop).filter(Boolean)
        })),
        recentActivity: recentActivities.map(activity => ({
          ...activity,
          timestamp: activity.timestamp.toISOString(),
          timeAgo: getTimeAgo(activity.timestamp)
        })),
        cropDistribution,
        insights: {
          mostProductiveFarm: farms.length > 0 ? farms.reduce((prev, current) => 
            prev.fields.length > current.fields.length ? prev : current
          ).name : null,
          recommendedActions: generateRecommendations(farms, weatherAlerts),
          upcomingTasks: generateUpcomingTasks(farms)
        }
      }

      return createSuccessResponse({
        data: stats,
        summary: {
          totalFarms,
          activeFields,
          totalArea: Math.round(totalArea * 100) / 100,
          healthScore: Math.round(avgHealthScore),
          lastUpdate: new Date().toISOString()
        },
        message: 'Dashboard statistics retrieved successfully'
      })

    } catch (error) {
      return handleApiError(error)
    }
  })
)

// Helper functions
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
  return 'Just now'
}

function generateRecommendations(farms: any[], alertsCount: number): string[] {
  const recommendations = []
  
  if (farms.length === 0) {
    recommendations.push('Create your first farm to start monitoring')
    recommendations.push('Set up field boundaries for satellite analysis')
  } else {
    const totalFields = farms.reduce((sum, farm) => sum + farm.fields.length, 0)
    
    if (totalFields === 0) {
      recommendations.push('Add fields to your farms for detailed monitoring')
    }
    
    if (alertsCount > 0) {
      recommendations.push('Check weather alerts for potential farm impacts')
    }
    
    recommendations.push('Review crop health analytics for optimization opportunities')
    
    if (farms.some(farm => farm.fields.some((field: any) => !field.isActive))) {
      recommendations.push('Activate inactive fields for the growing season')
    }
  }
  
  return recommendations.slice(0, 3) // Top 3 recommendations
}

function generateUpcomingTasks(farms: any[]): Array<{
  id: string
  title: string
  description: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
}> {
  const tasks = []
  const now = new Date()
  
  // Generate tasks based on farms and season
  farms.forEach(farm => {
    farm.fields.forEach((field: any) => {
      if (field.crop) {
        // Seasonal task generation
        const month = now.getMonth()
        
        if (month >= 2 && month <= 4) { // Spring
          tasks.push({
            id: `planting-${field.id}`,
            title: `Plan ${field.crop} planting`,
            description: `Prepare field ${field.name} for planting season`,
            dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            priority: 'high' as const
          })
        }
        
        if (month >= 5 && month <= 8) { // Growing season
          tasks.push({
            id: `monitoring-${field.id}`,
            title: `Monitor ${field.name}`,
            description: `Check crop health and irrigation needs`,
            dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            priority: 'medium' as const
          })
        }
      }
    })
  })
  
  // Add general maintenance tasks
  if (farms.length > 0) {
    tasks.push({
      id: 'weather-check',
      title: 'Review weather forecasts',
      description: 'Check upcoming weather conditions for all farms',
      dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'low' as const
    })
  }
  
  return tasks.slice(0, 5) // Top 5 upcoming tasks
}