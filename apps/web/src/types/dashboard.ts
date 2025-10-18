/**
 * Dashboard Data Types
 * Properly typed interfaces for dashboard components
 */

export interface WeatherConditions {
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  precipitation: number
  icon?: string
}

export interface WeatherAlert {
  id: string
  type: 'warning' | 'watch' | 'advisory'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  startTime: Date
  endTime: Date
  affectedArea?: string
}

export interface WeatherForecast {
  date: Date
  high: number
  low: number
  condition: string
  precipitation: number
  icon?: string
}

export interface WeatherData {
  current: WeatherConditions
  alerts: WeatherAlert[]
  forecast: WeatherForecast[]
}

export interface CropData {
  id: string
  farmId: string
  fieldId?: string
  cropType: string
  variety?: string
  status: 'PLANNED' | 'PLANTED' | 'GROWING' | 'READY_TO_HARVEST' | 'HARVESTED' | 'FAILED'
  plantingDate?: Date
  expectedHarvestDate?: Date
  actualHarvestDate?: Date
  area: number
  expectedYield?: number
  actualYield?: number
  healthScore?: number
  stressLevel?: 'none' | 'low' | 'moderate' | 'high' | 'severe'
  createdAt: Date
  updatedAt: Date
}

export interface TaskData {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  category?: string
  dueDate?: Date
  farmId?: string
  fieldId?: string
  cropId?: string
  userId: string
  assignedTo?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  farm?: {
    name: string
  }
  field?: {
    name: string
  }
  crop?: {
    cropType: string
    variety?: string
  }
}

export interface RecommendationData {
  id: string
  type: 'SPRAY' | 'HARVEST' | 'IRRIGATE' | 'PLANT' | 'FERTILIZE' | 'LIVESTOCK_HEALTH' | 'MARKET_SELL' | 'EQUIPMENT_MAINTAIN'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  confidence: number
  farmId: string
  fieldId?: string
  cropId?: string
  estimatedCost?: number
  estimatedSavings?: number
  timeframe: string
  reasoning: string[]
  actions: string[]
  createdAt: Date
  validUntil?: Date
}

export interface RegionalData {
  region: string
  averageYield: number
  averagePrice: number
  weatherTrends: {
    temperature: number
    precipitation: number
    comparison: 'above' | 'below' | 'normal'
  }
  marketTrends: {
    prices: Array<{
      commodity: string
      price: number
      change: number
    }>
  }
  benchmarks: {
    productivity: number
    efficiency: number
    sustainability: number
  }
}

export interface HarvestAlert {
  id: string
  fieldId: string
  cropId: string
  alertType: 'disease' | 'pest' | 'nutrient_deficiency' | 'water_stress' | 'harvest_ready'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  confidence: number
  detectedAt: Date
  fieldName: string
  cropType: string
  recommendations: string[]
  imageUrl?: string
}

export interface QueueStatus {
  queued: number
  processing: number
  completed: number
  failed: number
  avgProcessingTime: number
  healthStatus: 'healthy' | 'degraded' | 'unhealthy'
  lastProcessedAt?: Date
}

export interface BudgetData {
  id: string
  farmId: string
  year: number
  totalBudget: number
  allocated: number
  spent: number
  remaining: number
  categories: Array<{
    name: string
    budgeted: number
    spent: number
    remaining: number
  }>
  projectedROI: number
  actualROI?: number
  lastUpdated: Date
}

export interface DashboardData {
  weather: WeatherData | null
  crops: CropData[]
  tasks: TaskData[]
  recommendations: RecommendationData[]
  regionalData: RegionalData | null
  harvestAlerts: HarvestAlert[]
  queueStatus: QueueStatus | null
  budgetData: BudgetData | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

export interface DashboardDataContextType extends DashboardData {
  refetch: () => Promise<void>
  updateData: <K extends keyof DashboardData>(key: K, data: DashboardData[K]) => void
}