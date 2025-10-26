import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../lib/auth/session'
import { prisma } from '../../../../lib/prisma'
import { NBAEngine, FarmContext } from '../../../../lib/nba/decision-engine'
import { WeatherConditions, WeatherForecast, WeatherService } from '../../../../lib/services/weather'
import { cache, CacheKeys, CacheTTL, CacheTags } from '../../../../lib/cache/redis-client'
import { PerformanceMonitor, withCache } from '../../../../lib/performance/optimizations'
// import { BudgetManager } from '../../../../lib/financial/budget-manager' // Temporarily disabled
import { z } from 'zod'

const recommendationRequestSchema = z.object({
  farmId: z.string(),
  includeDecisionTypes: z.array(z.enum(['SPRAY', 'HARVEST', 'IRRIGATE', 'PLANT', 'FERTILIZE', 'LIVESTOCK_HEALTH', 'MARKET_SELL', 'EQUIPMENT_MAINTAIN'])).optional(),
  excludeCompletedTasks: z.boolean().default(true),
  maxRecommendations: z.number().int().min(1).max(20).default(10)
})

export async function POST(request: NextRequest) {
  const timerId = 'nba-recommendations-generation'
  PerformanceMonitor.startTimer(timerId)
  
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { farmId, includeDecisionTypes, excludeCompletedTasks, maxRecommendations } = 
      recommendationRequestSchema.parse(body)

    // Create cache key for this specific request
    const cacheKey = CacheKeys.nbaRecommendations(farmId) + 
      `:${includeDecisionTypes?.join(',') || 'all'}:${excludeCompletedTasks}:${maxRecommendations}`

    // Check if we have recent recommendations cached (unless force refresh)
    const forceRefresh = body.forceRefresh === true
    if (!forceRefresh) {
      const cached = await cache.get(cacheKey)
      if (cached) {
        PerformanceMonitor.endTimer(timerId)
        return NextResponse.json(cached)
      }
    }

    // Verify farm ownership with caching
    const farm = await withCache(
      CacheKeys.farmData(farmId),
      async () => {
        return await prisma.farm.findFirst({
          where: {
            id: farmId,
            ownerId: user.id
          },
          include: {
            fields: {
              include: {
                crops: {
                  where: {
                    status: {
                      in: ['PLANTED', 'GROWING', 'READY_TO_HARVEST']
                    }
                  },
                  orderBy: { plantingDate: 'desc' },
                  take: 1
                }
              }
            }
          }
        })
      },
      { ttl: CacheTTL.FARM_DATA, tags: [CacheTags.FARM] }
    )

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 })
    }

    // Get weather context for the farm
    const weatherContext = await getWeatherContext(farm.latitude, farm.longitude)
    
    // Get financial context for the farm
    const financialContext = await getFinancialContext(farmId)
    
    // Get livestock context if any livestock exists
    const livestockContext = await getLivestockContext(farmId)
    
    // Build comprehensive farm context for NBA engine
    const farmContext: FarmContext = {
      farmId: farm.id,
      userId: user.id,
      location: {
        latitude: farm.latitude,
        longitude: farm.longitude
      },
      fields: farm.fields.map(field => ({
        id: field.id,
        name: field.name || 'Unnamed Field',
        area: field.area || 0,
        cropType: field.crops[0]?.cropType || 'wheat',
        plantingDate: field.crops[0]?.plantingDate || undefined,
        lastSprayDate: undefined,
        lastHarvestDate: undefined
      })),
      weather: weatherContext,
      financials: financialContext,
      livestock: livestockContext
    }
    
    // Initialize NBA engine and generate real decisions
    const nbaEngine = new NBAEngine(process.env.OPENWEATHER_API_KEY)
    const decisions = await nbaEngine.generateDecisions(farmContext)
    
    // Filter decisions based on request parameters
    let filteredDecisions = decisions
    if (includeDecisionTypes && includeDecisionTypes.length > 0) {
      filteredDecisions = decisions.filter(decision => 
        includeDecisionTypes.includes(decision.type)
      )
    }
    
    // Limit results
    const limitedDecisions = filteredDecisions.slice(0, maxRecommendations)
    
    // Convert to response format and calculate scores
    const recommendations = limitedDecisions.map((decision, index) => {
      const scores = calculateDecisionScore(decision)
      return {
        id: `nba-${farmId}-${Date.now()}-${index}`,
        type: decision.type,
        priority: decision.priority,
        title: decision.title,
        description: decision.description,
        confidence: decision.confidence,
        timing: decision.timing,
        estimatedImpact: decision.estimatedImpact,
        explanation: decision.explanation,
        actionSteps: decision.actionSteps,
        targetField: decision.targetField,
        status: 'PENDING',
        urgencyScore: scores.urgency,
        roiScore: scores.roi,
        feasibilityScore: scores.feasibility,
        totalScore: scores.total
      }
    })
    
    // Store recommendations in database for tracking
    const savedRecommendations = await Promise.all(
      recommendations.map(async (rec) => {
        try {
          return await prisma.decisionRecommendation.create({
            data: {
              userId: user.id,
              farmId: farmId,
              type: rec.type,
              priority: rec.priority,
              title: rec.title,
              description: rec.description,
              urgencyScore: Math.round(rec.urgencyScore),
              roiScore: Math.round(rec.roiScore),
              feasibilityScore: Math.round(rec.feasibilityScore),
              totalScore: Math.round(rec.totalScore),
              confidence: rec.confidence,
              idealStart: rec.timing.idealStart,
              idealEnd: rec.timing.idealEnd,
              mustCompleteBy: rec.timing.mustCompleteBy,
              estimatedRevenue: rec.estimatedImpact.revenue || 0,
              estimatedCostSaving: rec.estimatedImpact.costSavings || 0,
              estimatedYieldGain: rec.estimatedImpact.yieldIncrease || 0,
              explanation: rec.explanation,
              actionSteps: rec.actionSteps,
              targetField: rec.targetField,
              status: 'PENDING'
            }
          })
        } catch (error) {

          return rec
        }
      })
    )

    const response = {
      success: true,
      recommendations,
      metadata: {
        farmName: farm.name,
        totalDecisionsEvaluated: decisions.length,
        recommendationsReturned: recommendations.length,
        averageConfidence: recommendations.length > 0 
          ? Math.round(recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length)
          : 0,
        generatedAt: new Date().toISOString(),
        performanceMs: PerformanceMonitor.endTimer(timerId),
        cached: false
      }
    }

    // Cache the response for future requests (5 minutes TTL)
    await cache.set(cacheKey, response, { ttl: 300, tags: [CacheTags.FARM, CacheTags.NBA] })
    
    return NextResponse.json(response)

  } catch (error) {
    PerformanceMonitor.endTimer(timerId)
    console.error('Error generating NBA recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const farmId = searchParams.get('farmId')
    const status = searchParams.get('status') || 'PENDING'
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

    if (!farmId) {
      return NextResponse.json({ error: 'farmId required' }, { status: 400 })
    }

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

    // Get existing recommendations
    const recommendations = await prisma.decisionRecommendation.findMany({
      where: {
        farmId,
        status,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      orderBy: [
        { totalScore: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    })

    return NextResponse.json({
      recommendations: recommendations.map(rec => ({
        id: rec.id,
        type: rec.type,
        priority: rec.priority,
        title: rec.title,
        description: rec.description,
        confidence: rec.confidence,
        totalScore: rec.totalScore,
        timing: {
          idealStart: rec.idealStart,
          idealEnd: rec.idealEnd,
          mustCompleteBy: rec.mustCompleteBy
        },
        estimatedImpact: {
          revenue: rec.estimatedRevenue,
          costSavings: rec.estimatedCostSaving,
          yieldIncrease: rec.estimatedYieldGain
        },
        explanation: rec.explanation,
        actionSteps: rec.actionSteps,
        targetField: rec.targetField,
        status: rec.status,
        createdAt: rec.createdAt
      }))
    })

  } catch (error) {
    console.error('Error fetching NBA recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}

/**
 * Get weather context for farm location
 */
async function getWeatherContext(latitude: number, longitude: number): Promise<{current: WeatherConditions, forecast: WeatherForecast[]}> {
  const weatherService = new WeatherService(process.env.OPENWEATHER_API_KEY)
  
  const [current, forecast] = await Promise.all([
    weatherService.getCurrentWeather(latitude, longitude),
    weatherService.getWeatherForecast(latitude, longitude, 7)
  ])

  return { current, forecast }
}

/**
 * Get financial context for farm
 */
async function getFinancialContext(farmId: string): Promise<{
  cashAvailable: number
  monthlyBudget: number
  monthlyBudgetRemaining: number
  totalBudget: number
  totalBudgetUsed: number
  totalBudgetRemaining: number
  budgetCategories: any[]
  ytdRevenue: number
  ytdExpenses: number
}> {
  const currentYear = new Date().getFullYear()
  
  const transactions = await prisma.financialTransaction.findMany({
    where: {
      farmId,
      transactionDate: {
        gte: new Date(currentYear, 0, 1),
        lt: new Date(currentYear + 1, 0, 1)
      }
    }
  })

  const ytdRevenue = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const ytdExpenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  // Get real budget information - temporarily disabled
  // const budget = await BudgetManager.getFarmBudget(farmId, currentYear)
  // const monthlyBudgetRemaining = await BudgetManager.getMonthlyBudgetRemaining(farmId)
  const budget = null
  const monthlyBudgetRemaining = 50000

  return {
    cashAvailable: ytdRevenue - ytdExpenses,
    monthlyBudget: 50000,
    monthlyBudgetRemaining,
    totalBudget: 0,
    totalBudgetUsed: ytdExpenses,
    totalBudgetRemaining: 0,
    budgetCategories: [],
    ytdRevenue,
    ytdExpenses
  }
}

/**
 * Get livestock context for farm
 */
async function getLivestockContext(farmId: string): Promise<{
  totalAnimals: number
  species: Array<{
    type: string
    count: number
    lastVaccination?: Date
  }>
} | undefined> {
  const recentEvents = await prisma.livestockEvent.findMany({
    where: {
      farmId,
      eventDate: {
        gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Last year
      }
    },
    orderBy: { eventDate: 'desc' }
  })

  if (recentEvents.length === 0) return undefined

  const speciesMap = new Map<string, { count: number, lastVaccination?: Date }>()
  
  for (const event of recentEvents) {
    if (!speciesMap.has(event.livestockType)) {
      speciesMap.set(event.livestockType, { count: 0 })
    }
    
    const species = speciesMap.get(event.livestockType)!
    
    if (event.eventType === 'VACCINATION' && !species.lastVaccination) {
      species.lastVaccination = event.eventDate
    }
    
    // Estimate current count (simplified)
    species.count = event.animalCount
  }

  const species = Array.from(speciesMap.entries()).map(([type, data]) => ({
    type,
    count: data.count,
    lastVaccination: data.lastVaccination
  }))

  return {
    totalAnimals: species.reduce((sum, s) => sum + s.count, 0),
    species
  }
}

/**
 * Calculate decision scores for storage
 */
function calculateDecisionScore(decision: any): {
  urgency: number
  roi: number
  feasibility: number
  total: number
} {
  let urgency = 0
  if (decision.priority === 'URGENT') urgency = 100
  else if (decision.priority === 'HIGH') urgency = 75
  else if (decision.priority === 'MEDIUM') urgency = 50
  else urgency = 25

  const totalImpact = 
    (decision.estimatedImpact.revenue || 0) +
    (decision.estimatedImpact.costSavings || 0) +
    ((decision.estimatedImpact.yieldIncrease || 0) * 1000)
  
  const roi = Math.min(100, (totalImpact / 10000) * 100)
  const feasibility = decision.confidence
  const total = (urgency * 0.4) + (roi * 0.4) + (feasibility * 0.2)

  return { urgency, roi, feasibility, total }
}