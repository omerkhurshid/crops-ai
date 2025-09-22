'use client'

import React, { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { 
  CheckSquare,
  Clock,
  CloudRain,
  Sun,
  Wind,
  Thermometer,
  AlertTriangle,
  Calendar,
  Wrench,
  Droplets,
  Leaf,
  TrendingUp,
  Plus,
  RefreshCw
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface WeatherTask {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  timeframe: string
  weatherTrigger: string
  category: 'planting' | 'spraying' | 'harvest' | 'maintenance' | 'monitoring'
  estimatedTime: string
  tools: string[]
  conditions: string
  farmImpact: string
  isRecommended: boolean
}

interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  precipitation: number
  forecast3Day: Array<{
    date: string
    condition: string
    temp: number
    precipitation: number
    windSpeed: number
  }>
}

interface WeatherTasksGeneratorProps {
  farmData?: {
    latitude?: number
    longitude?: number
  }
  crops?: any[]
  className?: string
}

export function WeatherTasksGenerator({ farmData, crops, className }: WeatherTasksGeneratorProps) {
  const [tasks, setTasks] = useState<WeatherTask[]>([])
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())

  useEffect(() => {
    generateWeatherTasks()
  }, [farmData, crops])

  const generateWeatherTasks = async () => {
    try {
      // Get current weather data
      let weather: WeatherData = {
        temperature: 72,
        humidity: 65,
        windSpeed: 8,
        precipitation: 0,
        forecast3Day: [
          { date: new Date().toISOString(), condition: 'sunny', temp: 75, precipitation: 0, windSpeed: 6 },
          { date: new Date(Date.now() + 86400000).toISOString(), condition: 'partly-cloudy', temp: 73, precipitation: 10, windSpeed: 12 },
          { date: new Date(Date.now() + 172800000).toISOString(), condition: 'rainy', temp: 68, precipitation: 85, windSpeed: 15 }
        ]
      }

      if (farmData?.latitude && farmData?.longitude) {
        try {
          const response = await fetch('/api/weather/current')
          if (response.ok) {
            const data = await response.json()
            weather = {
              temperature: data.main?.temp || 72,
              humidity: data.main?.humidity || 65,
              windSpeed: data.wind?.speed * 2.237 || 8, // Convert m/s to mph
              precipitation: data.rain?.['1h'] || 0,
              forecast3Day: weather.forecast3Day // Use mock forecast for now
            }
          }
        } catch (error) {
          console.error('Weather fetch failed, using defaults:', error)
        }
      }

      setWeatherData(weather)
      
      // Generate tasks based on weather conditions using analytical model
      const generatedTasks = await generateTasksFromWeather(weather, crops || [])
      setTasks(generatedTasks)
      
    } catch (error) {
      console.error('Error generating weather tasks:', error)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  const generateTasksFromWeather = async (weather: WeatherData, cropsList: any[]): Promise<WeatherTask[]> => {
    try {
      // Try to use the real analytical model first
      const modelInput = {
        weather: {
          temperature: weather.temperature,
          humidity: weather.humidity,
          windSpeed: weather.windSpeed,
          precipitation: weather.precipitation,
          forecast: weather.forecast3Day
        },
        crops: cropsList.map(crop => ({
          type: crop.cropType || crop.type || 'corn',
          stage: crop.status || 'growing',
          area: crop.area || 100,
          plantingDate: crop.plantingDate,
          expectedHarvestDate: crop.expectedHarvestDate
        })),
        date: new Date().toISOString(),
        season: getSeason(),
        location: {
          latitude: farmData?.latitude || 39.8283,  // Geographic center of US
          longitude: farmData?.longitude || -98.5795
        }
      }

      // Call the weather task prediction model
      const response = await fetch('/api/ml/weather-tasks/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId: 'weather-task-generator',
          input: modelInput
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.success && data.prediction) {
          // Transform model output to our WeatherTask format
          const modelTasks = data.prediction.tasks || []
          
          return modelTasks.map((task: any, index: number) => ({
            id: task.id || `model-task-${index}`,
            title: task.title || 'Model Generated Task',
            description: task.description || task.details || '',
            priority: task.priority || 'medium',
            timeframe: task.timeframe || 'Today',
            weatherTrigger: task.weatherTrigger || task.trigger || formatWeatherConditions(weather),
            category: task.category || 'monitoring',
            estimatedTime: task.estimatedTime || task.duration || '1-2 hours',
            tools: task.tools || task.equipment || [],
            conditions: task.conditions || formatWeatherConditions(weather),
            farmImpact: task.farmImpact || task.impact || 'Optimize farm operations',
            isRecommended: task.isRecommended !== undefined ? task.isRecommended : task.confidence > 0.7
          })).sort((a: WeatherTask, b: WeatherTask) => {
            const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
            return priorityOrder[b.priority] - priorityOrder[a.priority]
          })
        }
      } else {
        console.log('Weather task model API not available, using fallback logic')
      }
    } catch (error) {
      console.error('Error calling weather task model:', error)
    }

    // Return empty array if model is not available - show proper "no data" state
    console.log('Weather task model not available, showing no data state instead of fallback tasks')
    return []
  }

  const getSeason = (): string => {
    const month = new Date().getMonth()
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'fall'
    return 'winter'
  }

  const formatWeatherConditions = (weather: WeatherData): string => {
    return `${weather.temperature}°F, ${weather.humidity}% humidity, ${weather.windSpeed}mph wind, ${weather.precipitation}in rain`
  }

  const generateFallbackTasks = (weather: WeatherData, cropsList: any[]): WeatherTask[] => {
    const tasks: WeatherTask[] = []
    const today = new Date()
    
    // Current conditions tasks
    if (weather.windSpeed < 10 && weather.precipitation === 0) {
      tasks.push({
        id: 'spray-optimal',
        title: 'Perfect Spraying Conditions',
        description: 'Low wind and no rain make this ideal for pesticide/herbicide application',
        priority: 'high',
        timeframe: 'Today',
        weatherTrigger: 'Low wind, no precipitation',
        category: 'spraying',
        estimatedTime: '2-4 hours',
        tools: ['Sprayer', 'PPE', 'Chemicals'],
        conditions: `Wind: ${weather.windSpeed}mph, No rain`,
        farmImpact: 'Effective pest/weed control',
        isRecommended: true
      })
    }

    if (weather.windSpeed > 15) {
      tasks.push({
        id: 'secure-equipment',
        title: 'Secure Farm Equipment',
        description: 'High winds expected - secure loose equipment and check building structures',
        priority: 'urgent',
        timeframe: 'Next 2 hours',
        weatherTrigger: 'High wind speeds',
        category: 'maintenance',
        estimatedTime: '1 hour',
        tools: ['Tie-downs', 'Inspection checklist'],
        conditions: `Wind: ${weather.windSpeed}mph`,
        farmImpact: 'Prevent equipment damage',
        isRecommended: true
      })
    }

    // Temperature-based tasks
    if (weather.temperature > 85) {
      tasks.push({
        id: 'heat-stress-check',
        title: 'Monitor Crop Heat Stress',
        description: 'High temperatures can stress crops - check for wilting and consider irrigation',
        priority: 'medium',
        timeframe: 'This afternoon',
        weatherTrigger: 'High temperature',
        category: 'monitoring',
        estimatedTime: '45 minutes',
        tools: ['Thermometer', 'Soil moisture probe'],
        conditions: `Temperature: ${weather.temperature}°F`,
        farmImpact: 'Prevent heat damage to crops',
        isRecommended: true
      })
    }

    if (weather.temperature < 40) {
      tasks.push({
        id: 'frost-protection',
        title: 'Implement Frost Protection',
        description: 'Cold temperatures may damage sensitive crops - consider protective measures',
        priority: 'urgent',
        timeframe: 'Before dawn',
        weatherTrigger: 'Low temperature',
        category: 'monitoring',
        estimatedTime: '2 hours',
        tools: ['Covers', 'Irrigation system', 'Thermometer'],
        conditions: `Temperature: ${weather.temperature}°F`,
        farmImpact: 'Protect crops from frost damage',
        isRecommended: true
      })
    }

    // Forecast-based tasks
    const rainComingSoon = weather.forecast3Day.some(day => day.precipitation > 50)
    if (rainComingSoon && weather.precipitation === 0) {
      tasks.push({
        id: 'pre-rain-fieldwork',
        title: 'Complete Field Work Before Rain',
        description: 'Heavy rain expected in 1-2 days - finish any field operations now',
        priority: 'high',
        timeframe: 'Next 24 hours',
        weatherTrigger: 'Rain forecast',
        category: 'planting',
        estimatedTime: '4-6 hours',
        tools: ['Tractor', 'Implements', 'Seeds/fertilizer'],
        conditions: 'Rain coming in 1-2 days',
        farmImpact: 'Complete planting before weather turns',
        isRecommended: true
      })
    }

    // Humidity-based tasks
    if (weather.humidity > 80) {
      tasks.push({
        id: 'disease-monitoring',
        title: 'Monitor for Plant Diseases',
        description: 'High humidity increases disease risk - scout fields for early signs',
        priority: 'medium',
        timeframe: 'This week',
        weatherTrigger: 'High humidity',
        category: 'monitoring',
        estimatedTime: '1.5 hours',
        tools: ['Field notebook', 'Magnifying glass', 'Camera'],
        conditions: `Humidity: ${weather.humidity}%`,
        farmImpact: 'Early disease detection and treatment',
        isRecommended: true
      })
    }

    // Seasonal tasks based on current conditions
    const month = today.getMonth()
    if (month >= 8 && month <= 10 && weather.windSpeed < 12) { // Fall harvest season
      tasks.push({
        id: 'harvest-planning',
        title: 'Plan Harvest Operations',
        description: 'Good weather window for harvest - check crop maturity and equipment readiness',
        priority: 'high',
        timeframe: 'This week',
        weatherTrigger: 'Favorable harvest conditions',
        category: 'harvest',
        estimatedTime: '3 hours',
        tools: ['Combine', 'Grain cart', 'Storage bins'],
        conditions: 'Dry conditions, low wind',
        farmImpact: 'Optimize harvest timing and quality',
        isRecommended: true
      })
    }

    if (month >= 3 && month <= 5 && weather.temperature > 50) { // Spring planting
      tasks.push({
        id: 'soil-preparation',
        title: 'Prepare Fields for Planting',
        description: 'Temperature and conditions suitable for field preparation and planting',
        priority: 'medium',
        timeframe: 'Next few days',
        weatherTrigger: 'Suitable planting temperature',
        category: 'planting',
        estimatedTime: '6-8 hours',
        tools: ['Tractor', 'Tillage equipment', 'Planter'],
        conditions: `Temperature: ${weather.temperature}°F`,
        farmImpact: 'Optimal planting conditions',
        isRecommended: weather.temperature > 55 && weather.precipitation < 20
      })
    }

    // Equipment maintenance during poor weather
    if (weather.precipitation > 50 || weather.windSpeed > 20) {
      tasks.push({
        id: 'indoor-maintenance',
        title: 'Equipment Maintenance Day',
        description: 'Weather prevents field work - perfect time for equipment servicing and repairs',
        priority: 'low',
        timeframe: 'Today',
        weatherTrigger: 'Poor weather for fieldwork',
        category: 'maintenance',
        estimatedTime: '4-6 hours',
        tools: ['Tools', 'Oil/filters', 'Grease gun', 'Manual'],
        conditions: 'Indoor work weather',
        farmImpact: 'Maintain equipment reliability',
        isRecommended: true
      })
    }

    return tasks.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  const getCategoryIcon = (category: string) => {
    const iconMap = {
      planting: Leaf,
      spraying: Droplets,
      harvest: CheckSquare,
      maintenance: Wrench,
      monitoring: TrendingUp
    }
    return iconMap[category as keyof typeof iconMap] || CheckSquare
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 border-red-200 text-red-800'
      case 'high': return 'bg-orange-100 border-orange-200 text-orange-800'
      case 'medium': return 'bg-yellow-100 border-yellow-200 text-yellow-800'
      default: return 'bg-blue-100 border-blue-200 text-blue-800'
    }
  }

  const toggleTaskComplete = (taskId: string) => {
    const newCompleted = new Set(completedTasks)
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId)
    } else {
      newCompleted.add(taskId)
    }
    setCompletedTasks(newCompleted)
  }

  const recommendedTasks = tasks.filter(t => t.isRecommended && !completedTasks.has(t.id))

  if (loading) {
    return (
      <ModernCard variant="soft" className={className}>
        <ModernCardHeader>
          <ModernCardTitle className="flex items-center gap-2">
            <CloudRain className="h-5 w-5 text-blue-600 animate-pulse" />
            Weather-Based Tasks
          </ModernCardTitle>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </ModernCardContent>
      </ModernCard>
    )
  }

  return (
    <ModernCard variant="soft" className={className}>
      <ModernCardHeader>
        <div className="flex items-center justify-between">
          <ModernCardTitle className="flex items-center gap-2">
            <CloudRain className="h-5 w-5 text-blue-600" />
            Weather-Based Tasks
            {recommendedTasks.length > 0 && (
              <Badge className="bg-blue-100 text-blue-800">
                {recommendedTasks.length} Recommended
              </Badge>
            )}
          </ModernCardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={generateWeatherTasks}
          >
            <Plus className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
        {weatherData && (
          <div className="flex items-center gap-4 text-xs text-gray-600 mt-2">
            <span className="flex items-center gap-1">
              <Thermometer className="h-3 w-3" />
              {weatherData.temperature}°F
            </span>
            <span className="flex items-center gap-1">
              <Wind className="h-3 w-3" />
              {weatherData.windSpeed}mph
            </span>
            <span className="flex items-center gap-1">
              <Droplets className="h-3 w-3" />
              {weatherData.humidity}% humidity
            </span>
          </div>
        )}
      </ModernCardHeader>
      <ModernCardContent className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-6">
            <Sun className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">No weather-based tasks available</p>
            <p className="text-xs text-gray-500">Our analytical models haven't identified any weather-related actions at this time</p>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={generateWeatherTasks}
              className="mt-3 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Check Again
            </Button>
          </div>
        ) : (
          tasks.slice(0, 5).map((task) => {
            const Icon = getCategoryIcon(task.category)
            const isCompleted = completedTasks.has(task.id)
            
            return (
              <div
                key={task.id}
                className={cn(
                  'p-4 rounded-lg border transition-all',
                  task.isRecommended ? getPriorityColor(task.priority) : 'bg-gray-50 border-gray-200',
                  isCompleted && 'opacity-60'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className={cn(
                        'mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center',
                        isCompleted 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-gray-300 hover:border-gray-400'
                      )}
                    >
                      {isCompleted && <CheckSquare className="h-3 w-3" />}
                    </button>
                    
                    <div className="flex-1">
                      <h4 className={cn(
                        'font-semibold text-sm mb-1',
                        isCompleted && 'line-through'
                      )}>
                        {task.title}
                      </h4>
                      <p className="text-xs text-gray-700 mb-2">{task.description}</p>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {task.timeframe}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {task.estimatedTime}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-gray-600">
                        <div className="flex items-center gap-1 mb-1">
                          <Icon className="h-3 w-3" />
                          <span>{task.category} • {task.conditions}</span>
                        </div>
                        <div className="text-gray-500">
                          Impact: {task.farmImpact}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-2">
                    {task.priority === 'urgent' && (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    {task.isRecommended && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        
        {tasks.length > 5 && (
          <div className="text-center pt-2">
            <Button variant="ghost" size="sm">
              View All {tasks.length} Tasks
            </Button>
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  )
}