'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Navbar } from '../../components/navigation/navbar'
import { AlertTriangle, Droplets, Leaf, TrendingUp, TrendingDown, Activity, Eye } from 'lucide-react'

interface VegetationIndices {
  ndvi: number
  evi: number
  savi: number
  ndre: number
  gndvi: number
  ndwi: number
  msavi: number
  gci: number
}

interface FieldHealthData {
  fieldId: string
  fieldName: string
  healthScore: number
  stressLevel: 'none' | 'low' | 'moderate' | 'high' | 'severe'
  indices: VegetationIndices
  stressIndicators: {
    drought: { severity: number; confidence: number }
    disease: { severity: number; confidence: number }
    nutrient: { severity: number; confidence: number }
    pest: { severity: number; confidence: number }
  }
  recommendations: {
    immediate: string[]
    shortTerm: string[]
    seasonal: string[]
  }
  spatialAnalysis: {
    zones: {
      excellent: { percentage: number; area: number }
      good: { percentage: number; area: number }
      moderate: { percentage: number; area: number }
      poor: { percentage: number; area: number }
    }
  }
  yieldPrediction: {
    estimated: number
    confidence: number
    factors: string[]
  }
  biomassEstimate: number
  analysisDate: string
}

interface StressData {
  overall: 'none' | 'low' | 'moderate' | 'high' | 'severe'
  water: 'none' | 'low' | 'moderate' | 'high' | 'severe'
  nitrogen: 'none' | 'low' | 'moderate' | 'high' | 'severe'
  chlorophyll: 'none' | 'low' | 'moderate' | 'high' | 'severe'
  confidence: number
  recommendations: string[]
}

export default function CropHealthPage() {
  const [healthData, setHealthData] = useState<FieldHealthData | null>(null)
  const [stressData, setStressData] = useState<StressData | null>(null)
  const [fields, setFields] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [fieldsLoading, setFieldsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedField, setSelectedField] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'indices' | 'stress' | 'recommendations'>('overview')

  useEffect(() => {
    fetchFields()
  }, [])

  useEffect(() => {
    if (selectedField) {
      fetchHealthData()
    }
  }, [selectedField])

  const fetchFields = async () => {
    try {
      setFieldsLoading(true)
      const response = await fetch('/api/fields')
      
      if (!response.ok) throw new Error('Failed to fetch fields')
      
      const data = await response.json()
      const userFields = data.fields || []
      
      setFields(userFields)
      
      // Auto-select first field if available
      if (userFields.length > 0 && !selectedField) {
        setSelectedField(userFields[0].id)
      }
    } catch (err) {
      console.error('Error fetching fields:', err)
      // Fallback to demo fields if API fails
      setFields([
        { id: 'demo-field-1', displayName: 'Demo Field 1', farmName: 'Demo Farm' },
        { id: 'demo-field-2', displayName: 'Demo Field 2', farmName: 'Demo Farm' },
        { id: 'demo-field-3', displayName: 'Demo Field 3', farmName: 'Demo Farm' }
      ])
      setSelectedField('demo-field-1')
    } finally {
      setFieldsLoading(false)
    }
  }

  const fetchHealthData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch NDVI health analysis
      const healthResponse = await fetch('/api/satellite/ndvi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'health',
          fieldId: selectedField,
          fieldArea: 50,
          cropType: 'corn'
        })
      })

      if (!healthResponse.ok) throw new Error('Failed to fetch health data')
      const healthResult = await healthResponse.json()

      // Fetch stress analysis
      const stressResponse = await fetch('/api/satellite/ndvi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'stress',
          fieldId: selectedField
        })
      })

      if (!stressResponse.ok) throw new Error('Failed to fetch stress data')
      const stressResult = await stressResponse.json()

      setHealthData({
        fieldId: selectedField,
        fieldName: 'Demo Field 1',
        ...healthResult.data
      })
      setStressData(stressResult.data)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getStressColor = (level: string) => {
    switch (level) {
      case 'none': return 'bg-green-100 text-green-800'
      case 'low': return 'bg-yellow-100 text-yellow-800'
      case 'moderate': return 'bg-orange-100 text-orange-800'
      case 'high': return 'bg-red-100 text-red-800'
      case 'severe': return 'bg-red-200 text-red-900'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatIndex = (value: number) => value.toFixed(3)

  if (fieldsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-gray-500">Loading fields...</div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Card className="max-w-lg mx-auto">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <span>Error loading data: {error}</span>
              </div>
              <Button onClick={fetchHealthData} className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-agricultural">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Crop Health Analytics</h1>
            <p className="text-gray-600">NDVI analysis and vegetation health monitoring</p>
          </div>

          {/* Field Selection */}
          <div className="mb-6">
            {fieldsLoading ? (
              <div className="animate-pulse bg-gray-200 h-10 w-48 rounded-md"></div>
            ) : fields.length > 0 ? (
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="block w-64 rounded-md border-gray-300 shadow-sm focus:border-crops-green-500 focus:ring-crops-green-500"
              >
                <option value="">Select a field...</option>
                {fields.map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.displayName} {field.area ? `(${field.area} ha)` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-gray-500 text-sm">
                No fields found. <Link href="/farms/create" className="text-crops-green-600 hover:underline">Create a farm</Link> to get started.
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'indices', label: 'Vegetation Indices', icon: Leaf },
                { id: 'stress', label: 'Stress Analysis', icon: AlertTriangle },
                { id: 'recommendations', label: 'Recommendations', icon: TrendingUp }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === id
                      ? 'border-crops-green-500 text-crops-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Loading State */}
          {loading && selectedField && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-pulse text-gray-500">Loading crop health data...</div>
            </div>
          )}

          {/* No Field Selected */}
          {!selectedField && !loading && (
            <div className="text-center py-16">
              <Leaf className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Field Selected</h3>
              <p className="text-gray-500 mb-4">Select a field from the dropdown above to view crop health analytics</p>
              {fields.length === 0 && (
                <Link href="/farms/create" className="text-crops-green-600 hover:underline">
                  Create your first farm to get started
                </Link>
              )}
            </div>
          )}

          {/* Tab Content */}
          {!loading && selectedField && activeTab === 'overview' && healthData && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">Health Score</p>
                        <div className={`text-2xl font-bold ${getHealthColor(healthData.healthScore)}`}>
                          {healthData.healthScore}/100
                        </div>
                      </div>
                      <Activity className={`h-8 w-8 ${getHealthColor(healthData.healthScore).replace('text-', 'text-')}`} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">NDVI</p>
                        <div className="text-2xl font-bold text-green-600">
                          {formatIndex(healthData.indices.ndvi)}
                        </div>
                      </div>
                      <Leaf className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">Yield Prediction</p>
                        <div className="text-2xl font-bold text-blue-600">
                          {healthData.yieldPrediction.estimated}t/ha
                        </div>
                        <p className="text-xs text-gray-500">
                          {(healthData.yieldPrediction.confidence * 100).toFixed(0)}% confidence
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">Stress Level</p>
                        <Badge className={getStressColor(healthData.stressLevel)}>
                          {healthData.stressLevel.toUpperCase()}
                        </Badge>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Field Zones Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Field Health Zones</CardTitle>
                  <CardDescription>Distribution of vegetation health across the field</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(healthData.spatialAnalysis.zones).map(([zone, data]) => (
                      <div key={zone} className="text-center p-4 rounded-lg border">
                        <div className={`text-2xl font-bold ${
                          zone === 'excellent' ? 'text-green-600' :
                          zone === 'good' ? 'text-lime-600' :
                          zone === 'moderate' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {data.percentage}%
                        </div>
                        <div className="text-sm text-gray-600 capitalize">{zone}</div>
                        <div className="text-xs text-gray-500">{data.area.toFixed(1)} ha</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {!loading && selectedField && activeTab === 'indices' && healthData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Primary Indices</CardTitle>
                  <CardDescription>Core vegetation health indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium">NDVI (Vegetation Index)</span>
                    <span className="font-mono text-green-600">{formatIndex(healthData.indices.ndvi)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">EVI (Enhanced Vegetation)</span>
                    <span className="font-mono text-green-600">{formatIndex(healthData.indices.evi)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">SAVI (Soil Adjusted)</span>
                    <span className="font-mono text-green-600">{formatIndex(healthData.indices.savi)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">NDRE (Red Edge)</span>
                    <span className="font-mono text-green-600">{formatIndex(healthData.indices.ndre)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Specialized Indices</CardTitle>
                  <CardDescription>Specific stress and condition indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium">GNDVI (Green NDVI)</span>
                    <span className="font-mono text-blue-600">{formatIndex(healthData.indices.gndvi)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">NDWI (Water Index)</span>
                    <span className="font-mono text-blue-600">{formatIndex(healthData.indices.ndwi)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">MSAVI (Modified SAVI)</span>
                    <span className="font-mono text-blue-600">{formatIndex(healthData.indices.msavi)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">GCI (Chlorophyll Index)</span>
                    <span className="font-mono text-blue-600">{formatIndex(healthData.indices.gci)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {!loading && selectedField && activeTab === 'stress' && stressData && healthData && (
            <div className="space-y-6">
              {/* Overall Stress */}
              <Card>
                <CardHeader>
                  <CardTitle>Stress Detection Summary</CardTitle>
                  <CardDescription>Overall crop stress analysis with {(stressData.confidence * 100).toFixed(0)}% confidence</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Badge className={`${getStressColor(stressData.overall)} text-lg py-1 px-3`}>
                      {stressData.overall.toUpperCase()} STRESS
                    </Badge>
                    <div className="text-sm text-gray-600">
                      Confidence: {(stressData.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Specific Stress Types */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Droplets className="h-5 w-5 text-blue-600" />
                      <span>Water Stress</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge className={getStressColor(stressData.water)}>
                      {stressData.water.toUpperCase()}
                    </Badge>
                    <div className="mt-2 text-sm text-gray-600">
                      NDWI: {formatIndex(healthData.indices.ndwi)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Leaf className="h-5 w-5 text-green-600" />
                      <span>Nitrogen Status</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge className={getStressColor(stressData.nitrogen)}>
                      {stressData.nitrogen.toUpperCase()}
                    </Badge>
                    <div className="mt-2 text-sm text-gray-600">
                      NDRE: {formatIndex(healthData.indices.ndre)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Eye className="h-5 w-5 text-purple-600" />
                      <span>Chlorophyll</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge className={getStressColor(stressData.chlorophyll)}>
                      {stressData.chlorophyll.toUpperCase()}
                    </Badge>
                    <div className="mt-2 text-sm text-gray-600">
                      GCI: {formatIndex(healthData.indices.gci)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Stress Indicators */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Stress Indicators</CardTitle>
                  <CardDescription>Specific stress factors with severity and confidence levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(healthData.stressIndicators).map(([type, data]) => (
                      <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium capitalize">{type}</div>
                          <div className="text-sm text-gray-600">
                            Severity: {(data.severity * 100).toFixed(0)}% | 
                            Confidence: {(data.confidence * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              data.severity > 0.7 ? 'bg-red-500' :
                              data.severity > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.max(5, data.severity * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {!loading && selectedField && activeTab === 'recommendations' && healthData && stressData && (
            <div className="space-y-6">
              {stressData.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span>Stress-Based Recommendations</span>
                    </CardTitle>
                    <CardDescription>Actions based on detected stress conditions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {stressData.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {healthData.recommendations.immediate.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">Immediate Actions Required</CardTitle>
                    <CardDescription>Urgent tasks to address within 24-48 hours</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {healthData.recommendations.immediate.map((rec, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {healthData.recommendations.shortTerm.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-orange-600">Short-term Actions</CardTitle>
                    <CardDescription>Tasks to complete within 1-2 weeks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {healthData.recommendations.shortTerm.map((rec, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {healthData.recommendations.seasonal.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">Seasonal Planning</CardTitle>
                    <CardDescription>Long-term actions for optimal crop management</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {healthData.recommendations.seasonal.map((rec, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Yield Impact */}
              <Card>
                <CardHeader>
                  <CardTitle>Yield Prediction Analysis</CardTitle>
                  <CardDescription>Estimated impact on crop yield based on current conditions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Estimated Yield</span>
                      <span className="text-2xl font-bold text-green-600">
                        {healthData.yieldPrediction.estimated} tons/ha
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Biomass Estimate</span>
                      <span className="text-lg font-semibold text-blue-600">
                        {healthData.biomassEstimate} kg/ha
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Prediction Confidence</span>
                      <span className="text-lg font-semibold">
                        {(healthData.yieldPrediction.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    {healthData.yieldPrediction.factors.length > 0 && (
                      <div className="mt-4">
                        <p className="font-medium text-gray-700 mb-2">Impact Factors:</p>
                        <ul className="space-y-1">
                          {healthData.yieldPrediction.factors.map((factor, idx) => (
                            <li key={idx} className="text-sm text-gray-600">• {factor}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Refresh Button */}
          <div className="mt-8 flex justify-center">
            <Button onClick={fetchHealthData} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh Analysis'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}