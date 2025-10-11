'use client'

import { useState, useEffect } from 'react'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle, ModernCardDescription } from '../ui/modern-card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  CloudRain, Sun, Droplets, Thermometer, Wind, 
  AlertTriangle, CheckCircle2, Clock, TrendingUp,
  MapPin, Zap, Satellite, DollarSign, Eye, Activity, ArrowRight, Brain
} from 'lucide-react'

interface FieldData {
  id: string
  name: string
  ndvi: number
  health: 'excellent' | 'good' | 'warning' | 'critical'
  acres: number
  crop: string
  alerts: string[]
}

const DEMO_FIELDS: FieldData[] = [
  {
    id: '1',
    name: 'North Field',
    ndvi: 0.82,
    health: 'excellent',
    acres: 45.2,
    crop: 'Corn',
    alerts: []
  },
  {
    id: '2', 
    name: 'South Field',
    ndvi: 0.65,
    health: 'warning',
    acres: 38.7,
    crop: 'Soybeans',
    alerts: ['Nitrogen deficiency detected - apply 40 lbs/acre', 'Aphid pressure building - scout within 48 hours']
  },
  {
    id: '3',
    name: 'East Field', 
    ndvi: 0.78,
    health: 'good',
    acres: 52.1,
    crop: 'Corn',
    alerts: ['Irrigation needed within 3 days - soil moisture at 35%']
  },
  {
    id: '4',
    name: 'River Bottom',
    ndvi: 0.71,
    health: 'good',
    acres: 29.8,
    crop: 'Corn',
    alerts: ['Optimal for harvest in 12-15 days']
  }
]

const WEATHER_DATA = {
  temperature: 78,
  condition: 'Partly Cloudy',
  humidity: 68,
  windSpeed: 12,
  precipitation: 0,
  recommendation: 'Optimal spraying window: 6-10 AM tomorrow',
  forecast: [
    { day: 'Today', high: 78, low: 62, condition: 'Partly Cloudy', rain: 0 },
    { day: 'Tomorrow', high: 82, low: 65, condition: 'Sunny', rain: 0 },
    { day: 'Friday', high: 85, low: 68, condition: 'Thunderstorms', rain: 75 }
  ]
}

const FINANCIAL_DATA = {
  revenue: 145600,
  expenses: 89200,
  profit: 56400,
  profitMargin: 38.7,
  costPerAcre: 658,
  revenuePerAcre: 1075,
  projectedYield: { corn: 185, soybeans: 52 },
  comparison: { industry: 32.1, lastYear: 41.2 }
}

export function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState('satellite')
  const [selectedField, setSelectedField] = useState('2')

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'bg-green-500'
      case 'good': return 'bg-yellow-500' 
      case 'warning': return 'bg-orange-500'
      case 'critical': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getNdviColor = (ndvi: number) => {
    if (ndvi >= 0.8) return 'text-green-600'
    if (ndvi >= 0.7) return 'text-yellow-600'
    return 'text-orange-600'
  }

  const field = DEMO_FIELDS.find(f => f.id === selectedField) || DEMO_FIELDS[1]

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-sage-50 to-cream-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-sage-800 mb-4">
            See How AI Satellite Intelligence Works
          </h2>
          <p className="text-lg text-sage-600 max-w-3xl mx-auto">
            Experience live satellite monitoring with real field boundaries, actionable AI recommendations, and precision farming insights
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white">
            <TabsTrigger value="satellite" className="flex items-center gap-2">
              <Satellite className="h-4 w-4" />
              Field Analysis
            </TabsTrigger>
            <TabsTrigger value="weather" className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Smart Weather
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Financial Intelligence
            </TabsTrigger>
          </TabsList>

          {/* Satellite/NDVI Tab */}
          <TabsContent value="satellite">
            <ModernCard variant="floating" className="overflow-hidden">
              <ModernCardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <ModernCardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-green-600" />
                  Field Satellite Analysis - Wilson Farm, Iowa
                </ModernCardTitle>
                <ModernCardDescription>
                  AI detects crop stress and growth issues 2-3 weeks before visible to human eye
                </ModernCardDescription>
              </ModernCardHeader>
              
              <ModernCardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Realistic Farm Map */}
                  <div className="relative">
                    <div className="aspect-square bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg border-2 border-sage-300 relative overflow-hidden">
                      {/* Base satellite image background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-green-200/40 to-green-300/40">
                        
                        {/* North Field - Excellent Health */}
                        <div className="absolute top-2 left-2 right-2 h-1/3 bg-gradient-to-r from-green-400 to-green-500 rounded-lg border-2 border-green-600 opacity-90 shadow-sm">
                          <div className="absolute top-1 right-1 bg-green-700 text-white px-2 py-1 rounded text-xs font-bold">82% Health</div>
                        </div>
                        
                        {/* South Field - Warning (Stressed) */}
                        <div className="absolute top-1/3 left-2 right-1/2 bottom-2 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-lg border-2 border-orange-500 opacity-90 shadow-sm">
                          <div className="absolute top-1 right-1 bg-orange-700 text-white px-2 py-1 rounded text-xs font-bold">65% Health</div>
                        </div>
                        
                        {/* East Field - Good Health */}
                        <div className="absolute top-1/3 right-2 left-1/2 bottom-1/4 bg-gradient-to-br from-green-300 to-green-500 rounded-lg border-2 border-green-600 opacity-90 shadow-sm">
                          <div className="absolute top-1 right-1 bg-green-700 text-white px-2 py-1 rounded text-xs font-bold">78% Health</div>
                        </div>
                        
                        {/* River Bottom Field - Good Health */}
                        <div className="absolute bottom-2 right-2 left-1/2 h-1/4 bg-gradient-to-r from-green-300 to-green-400 rounded-lg border-2 border-green-500 opacity-90 shadow-sm">
                          <div className="absolute top-1 right-1 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">71% Health</div>
                        </div>
                        
                        {/* Field labels with better positioning */}
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white font-bold text-sm bg-black/30 px-2 py-1 rounded">North Field</div>
                        <div className="absolute top-1/2 left-1/4 text-white font-bold text-sm bg-black/30 px-2 py-1 rounded">South Field</div>
                        <div className="absolute top-1/2 right-1/4 text-white font-bold text-sm bg-black/30 px-2 py-1 rounded">East Field</div>
                        <div className="absolute bottom-6 right-1/4 text-white font-bold text-sm bg-black/30 px-2 py-1 rounded">River Bottom</div>
                        
                        {/* Farm details overlay */}
                        <div className="absolute top-2 left-2 bg-white/95 rounded-lg p-2 text-xs shadow-lg">
                          <div className="font-bold text-sage-800">Wilson Farm</div>
                          <div className="text-sage-600">Iowa, USA</div>
                          <div className="text-sage-600">165.8 acres total</div>
                        </div>
                      </div>
                      
                      {/* Enhanced Legend */}
                      <div className="absolute bottom-2 left-2 bg-white/95 rounded-lg p-3 text-xs shadow-lg">
                        <div className="font-bold mb-2 text-sage-800">Crop Health*</div>
                        <div className="flex items-center gap-1 mb-1">
                          <div className="w-3 h-3 bg-green-500 rounded border border-green-600"></div>
                          <span className="text-sage-700">Excellent (80%+)</span>
                        </div>
                        <div className="flex items-center gap-1 mb-1">
                          <div className="w-3 h-3 bg-yellow-500 rounded border border-yellow-600"></div>
                          <span className="text-sage-700">Good (70-80%)</span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          <div className="w-3 h-3 bg-orange-500 rounded border border-orange-600"></div>
                          <span className="text-sage-700">Needs Attention</span>
                        </div>
                        <div className="text-xs text-sage-500 italic">*Based on NDVI analysis</div>
                      </div>
                    </div>
                  </div>

                  {/* Field Details */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {DEMO_FIELDS.map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setSelectedField(f.id)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedField === f.id ? 'border-sage-500 bg-sage-50' : 'border-gray-200 bg-white hover:border-sage-300'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full ${getHealthColor(f.health)} mx-auto mb-1`}></div>
                          <div className="text-sm font-medium">{f.name}</div>
                          <div className="text-xs text-gray-600">{f.acres} acres</div>
                        </button>
                      ))}
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-sage-200 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-sage-800">{field.name} - {field.crop}</h3>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          field.health === 'excellent' ? 'bg-green-100 text-green-700' :
                          field.health === 'good' ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {field.health === 'excellent' ? 'Excellent' : 
                           field.health === 'good' ? 'Good' : 'Needs Attention'}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center p-2 bg-sage-50 rounded">
                          <div className="text-sm text-sage-600">Health Score</div>
                          <div className={`text-lg font-bold ${getNdviColor(field.ndvi)}`}>{Math.round(field.ndvi * 100)}%</div>
                        </div>
                        <div className="text-center p-2 bg-sage-50 rounded">
                          <div className="text-sm text-sage-600">Area</div>
                          <div className="text-lg font-bold text-sage-800">{field.acres}</div>
                          <div className="text-xs text-sage-600">acres</div>
                        </div>
                        <div className="text-center p-2 bg-sage-50 rounded">
                          <div className="text-sm text-sage-600">Est. Yield</div>
                          <div className="text-lg font-bold text-sage-800">
                            {field.crop === 'Corn' ? Math.round(field.ndvi * 220) : Math.round(field.ndvi * 65)}
                          </div>
                          <div className="text-xs text-sage-600">bu/acre</div>
                        </div>
                      </div>

                      {field.alerts.length > 0 ? (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sage-800 flex items-center gap-2">
                            <Brain className="h-4 w-4 text-blue-600" />
                            AI Recommendations
                          </h4>
                          {field.alerts.map((alert, idx) => (
                            <div key={idx} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3">
                              <div className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-blue-800 mb-1">Action Required</p>
                                  <p className="text-sm text-blue-700">{alert}</p>
                                  <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                                    <Clock className="h-3 w-3" />
                                    Confidence: 94% • Updated 2 hours ago
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sage-800 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            Status: All Good
                          </h4>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-sm text-green-700">No immediate actions needed. Crop health is excellent with optimal growth conditions.</p>
                            <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle2 className="h-3 w-3" />
                              Next scan in 3 days
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </ModernCardContent>
            </ModernCard>
          </TabsContent>

          {/* Weather Tab */}
          <TabsContent value="weather">
            <ModernCard variant="floating" className="overflow-hidden">
              <ModernCardHeader className="bg-gradient-to-r from-blue-50 to-sky-50">
                <ModernCardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Precision Weather Intelligence
                </ModernCardTitle>
                <ModernCardDescription>
                  Field-specific forecasts with AI-powered farming recommendations
                </ModernCardDescription>
              </ModernCardHeader>
              
              <ModernCardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Current Conditions */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-3xl font-bold text-blue-800">{WEATHER_DATA.temperature}°F</div>
                          <div className="text-blue-600">{WEATHER_DATA.condition}</div>
                        </div>
                        <Sun className="h-12 w-12 text-yellow-500" />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="text-center">
                          <Droplets className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                          <div className="font-medium">{WEATHER_DATA.humidity}%</div>
                          <div className="text-gray-600">Humidity</div>
                        </div>
                        <div className="text-center">
                          <Wind className="h-4 w-4 text-green-500 mx-auto mb-1" />
                          <div className="font-medium">{WEATHER_DATA.windSpeed} mph</div>
                          <div className="text-gray-600">Wind</div>
                        </div>
                        <div className="text-center">
                          <CloudRain className="h-4 w-4 text-purple-500 mx-auto mb-1" />
                          <div className="font-medium">{WEATHER_DATA.precipitation}%</div>
                          <div className="text-gray-600">Rain</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-sage-50 rounded-lg p-4 border border-sage-200">
                      <h3 className="font-semibold text-sage-800 mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        AI Recommendation
                      </h3>
                      <p className="text-sage-700">{WEATHER_DATA.recommendation}</p>
                    </div>
                  </div>

                  {/* 3-Day Forecast */}
                  <div>
                    <h3 className="font-semibold text-sage-800 mb-3">3-Day Precision Forecast</h3>
                    <div className="space-y-3">
                      {WEATHER_DATA.forecast.map((day, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="w-10 text-sm font-medium">{day.day}</div>
                            <div className="flex items-center gap-2">
                              {day.condition.includes('Thunder') ? 
                                <CloudRain className="h-5 w-5 text-blue-500" /> :
                                <Sun className="h-5 w-5 text-yellow-500" />
                              }
                              <span className="text-sm">{day.condition}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{day.high}°/{day.low}°</div>
                            <div className="text-sm text-blue-600">{day.rain}% rain</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ModernCardContent>
            </ModernCard>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial">
            <ModernCard variant="floating" className="overflow-hidden">
              <ModernCardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <ModernCardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Financial Performance Analytics
                </ModernCardTitle>
                <ModernCardDescription>
                  Real-time ROI tracking and profit optimization insights
                </ModernCardDescription>
              </ModernCardHeader>
              
              <ModernCardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Key Metrics */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="text-sm text-green-600 mb-1">Total Revenue</div>
                        <div className="text-2xl font-bold text-green-800">${FINANCIAL_DATA.revenue.toLocaleString()}</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="text-sm text-blue-600 mb-1">Net Profit</div>
                        <div className="text-2xl font-bold text-blue-800">${FINANCIAL_DATA.profit.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-sage-200">
                      <h3 className="font-semibold text-sage-800 mb-3">Profitability Analysis</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Profit Margin</span>
                          <span className="font-bold text-green-600">{FINANCIAL_DATA.profitMargin}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Revenue per Acre</span>
                          <span className="font-medium">${FINANCIAL_DATA.revenuePerAcre}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Cost per Acre</span>
                          <span className="font-medium">${FINANCIAL_DATA.costPerAcre}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Comparison */}
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 border border-sage-200">
                      <h3 className="font-semibold text-sage-800 mb-3">Performance vs Benchmarks</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>vs Industry Average</span>
                            <span className="text-green-600 font-medium">+{(FINANCIAL_DATA.profitMargin - FINANCIAL_DATA.comparison.industry).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>vs Last Year</span>
                            <span className="text-orange-600 font-medium">{(FINANCIAL_DATA.profitMargin - FINANCIAL_DATA.comparison.lastYear).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-orange-500 h-2 rounded-full" style={{width: '60%'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-sage-50 rounded-lg p-4 border border-sage-200">
                      <h3 className="font-semibold text-sage-800 mb-2">Projected Yields</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-sage-800">{FINANCIAL_DATA.projectedYield.corn}</div>
                          <div className="text-sm text-sage-600">bu/acre Corn</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-sage-800">{FINANCIAL_DATA.projectedYield.soybeans}</div>
                          <div className="text-sm text-sage-600">bu/acre Soybeans</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ModernCardContent>
            </ModernCard>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-8">
          <p className="text-sage-600 mb-4">
            This is just a glimpse. The full platform includes automated monitoring, predictive analytics, and precision recommendations for every decision.
          </p>
          <Button size="lg" className="bg-sage-600 hover:bg-sage-700 text-white px-8 py-3">
            <ArrowRight className="h-4 w-4 mr-2" />
            Start Your Free 30-Day Trial
          </Button>
        </div>
      </div>
    </section>
  )
}