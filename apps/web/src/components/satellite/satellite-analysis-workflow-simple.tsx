'use client'

import { useState } from 'react'
// import { GoogleMapsFieldEditor } from '../farm/google-maps-field-editor'
// import { FieldHealthMonitor } from './field-health-monitor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { Progress } from '../ui/progress'
import { 
  MapPin, Satellite, TrendingUp, CheckCircle, ArrowRight,
  Zap, Target, AlertTriangle, Download, Share, Activity
} from 'lucide-react'

interface Field {
  id: string
  name: string
  area: number
  boundaries: Array<{ lat: number; lng: number }>
  centerLat: number
  centerLng: number
}

interface WorkflowDemoProps {
  farmLocation: { lat: number; lng: number }
  onComplete?: (fields: Field[]) => void
}

export function SatelliteAnalysisWorkflow({ farmLocation, onComplete }: WorkflowDemoProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [definedFields, setDefinedFields] = useState<Field[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)

  const steps = [
    {
      id: 1,
      title: 'Define Field Boundaries',
      description: 'Use Google Maps to draw precise field boundaries',
      icon: MapPin,
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'active' : 'pending'
    },
    {
      id: 2,
      title: 'Satellite Analysis',
      description: 'AI analyzes field health using Sentinel Hub',
      icon: Satellite,
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'active' : 'pending'
    },
    {
      id: 3,
      title: 'Health Monitoring',
      description: 'View real-time field health and recommendations',
      icon: TrendingUp,
      status: currentStep > 3 ? 'completed' : currentStep === 3 ? 'active' : 'pending'
    }
  ]

  const handleFieldsDetected = async (fields: Field[]) => {
    setDefinedFields(fields)
    if (fields.length > 0) {
      setCurrentStep(2)
      setIsAnalyzing(true)

      try {
        const response = await fetch('/api/satellite/field-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fieldIds: fields.map(f => f.id),
            analysisType: 'comprehensive'
          })
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Analysis complete:', data)
          setAnalysisComplete(true)
          setCurrentStep(3)
        }
      } catch (error) {
        console.error('Analysis failed:', error)
      } finally {
        setIsAnalyzing(false)
      }
    }
  }

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white'
      case 'active': return 'bg-blue-500 text-white'
      default: return 'bg-gray-200 text-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Workflow Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Satellite className="h-5 w-5 mr-2 text-blue-600" />
            Complete Farm-to-Satellite Analysis Workflow
          </CardTitle>
          <CardDescription>
            From field boundary drawing to AI-powered crop health insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all ${getStepStatusColor(step.status)}`}>
                    {step.status === 'completed' ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <step.icon className="h-6 w-6" />
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-sm font-medium">{step.title}</div>
                    <div className="text-xs text-gray-600 max-w-24">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="mx-4 h-5 w-5 text-gray-400" />
                )}
              </div>
            ))}
          </div>

          <div className="mb-4">
            <Progress 
              value={(currentStep - 1) * 50} 
              className="h-2"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Start</span>
              <span>Step {currentStep} of 3</span>
              <span>Complete</span>
            </div>
          </div>

          <Alert className="border-blue-200 bg-blue-50">
            <steps[currentStep - 1].icon className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Current Step:</strong> {steps[currentStep - 1].title} - {steps[currentStep - 1].description}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Step 1: Field Boundary Drawing */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Step 1: Define Your Field Boundaries
            </CardTitle>
            <CardDescription>
              Draw precise field boundaries using Google Maps satellite view. 
              Auto-detection available using AI analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">Google Maps Field Editor (temporarily disabled for build fix)</p>
              <Button 
                onClick={() => handleFieldsDetected([
                  {
                    id: 'demo-field-1',
                    name: 'North Field',
                    area: 85.3,
                    boundaries: [
                      { lat: farmLocation.lat, lng: farmLocation.lng },
                      { lat: farmLocation.lat + 0.005, lng: farmLocation.lng + 0.005 },
                      { lat: farmLocation.lat + 0.005, lng: farmLocation.lng - 0.005 },
                      { lat: farmLocation.lat, lng: farmLocation.lng }
                    ],
                    centerLat: farmLocation.lat + 0.0025,
                    centerLng: farmLocation.lng
                  },
                  {
                    id: 'demo-field-2',
                    name: 'South Field',
                    area: 67.8,
                    boundaries: [
                      { lat: farmLocation.lat - 0.003, lng: farmLocation.lng },
                      { lat: farmLocation.lat - 0.003, lng: farmLocation.lng + 0.007 },
                      { lat: farmLocation.lat - 0.008, lng: farmLocation.lng + 0.007 },
                      { lat: farmLocation.lat - 0.008, lng: farmLocation.lng }
                    ],
                    centerLat: farmLocation.lat - 0.0055,
                    centerLng: farmLocation.lng + 0.0035
                  }
                ])}
              >
                Demo Field Creation
              </Button>
            </div>
            
            {definedFields.length > 0 && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="font-medium text-green-800">
                    {definedFields.length} field{definedFields.length !== 1 ? 's' : ''} defined
                  </span>
                </div>
                <div className="mt-2 text-sm text-green-700">
                  Total area: {definedFields.reduce((sum, f) => sum + f.area, 0).toFixed(1)} acres
                </div>
                <Button 
                  onClick={() => handleFieldsDetected(definedFields)}
                  className="mt-3"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? 'Starting Analysis...' : 'Proceed to Satellite Analysis'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Satellite Analysis */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Satellite className="h-5 w-5 mr-2" />
              Step 2: AI Satellite Analysis in Progress
            </CardTitle>
            <CardDescription>
              Analyzing {definedFields.length} fields using Sentinel Hub satellite imagery
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            {isAnalyzing ? (
              <div className="space-y-4">
                <div className="animate-pulse">
                  <Satellite className="h-16 w-16 mx-auto text-blue-600 mb-4" />
                </div>
                <h3 className="text-xl font-semibold">Processing Satellite Data</h3>
                <div className="space-y-2 text-sm text-gray-600 max-w-md mx-auto">
                  <div>🛰️ Accessing Sentinel-2 imagery</div>
                  <div>📊 Calculating NDVI and vegetation indices</div>
                  <div>🤖 AI stress detection analysis</div>
                  <div>📋 Generating recommendations</div>
                </div>
                <Progress value={75} className="max-w-md mx-auto" />
              </div>
            ) : analysisComplete ? (
              <div className="space-y-4">
                <CheckCircle className="h-16 w-16 mx-auto text-green-600" />
                <h3 className="text-xl font-semibold text-green-800">Analysis Complete!</h3>
                <p className="text-gray-600">
                  Satellite analysis finished for all {definedFields.length} fields
                </p>
                <Button 
                  onClick={() => setCurrentStep(3)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  View Health Monitoring Results
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <AlertTriangle className="h-16 w-16 mx-auto text-yellow-600" />
                <h3 className="text-xl font-semibold">Waiting for Analysis</h3>
                <p className="text-gray-600">
                  Complete field definition to start satellite analysis
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Health Monitoring Results */}
      {currentStep === 3 && analysisComplete && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Step 3: Real-Time Field Health Monitoring
              </CardTitle>
              <CardDescription>
                AI-powered crop health insights and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Target className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <div className="text-2xl font-bold text-green-700">
                    {definedFields.length}
                  </div>
                  <div className="text-sm text-green-600">Fields Monitored</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Zap className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <div className="text-2xl font-bold text-blue-700">
                    {Math.floor(Math.random() * 5)}
                  </div>
                  <div className="text-sm text-blue-600">Active Alerts</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Satellite className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <div className="text-2xl font-bold text-purple-700">
                    {(Math.random() * 0.4 + 0.6).toFixed(3)}
                  </div>
                  <div className="text-sm text-purple-600">Avg NDVI</div>
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share className="h-4 w-4 mr-2" />
                  Share Analysis
                </Button>
              </div>

              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Workflow Complete!</strong> Your fields are now being monitored with 
                  AI-powered satellite analysis. Health data updates every 16 days automatically.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Live Field Health Monitor */}
          <Card>
            <CardHeader>
              <CardTitle>Live Field Health Monitoring</CardTitle>
              <CardDescription>Real-time satellite data analysis (temporarily using placeholder)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-gray-600">
                <Activity className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                <p>Field Health Monitor displaying data for {definedFields.length} fields</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {definedFields.map((field) => (
                    <div key={field.id} className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">{field.name}</h4>
                      <p className="text-sm text-gray-600">{field.area.toFixed(1)} acres</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Healthy (NDVI: 0.72)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
              <CardDescription>
                Continue optimizing your farm with these advanced features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">🔄 Automated Monitoring</h4>
                  <p className="text-sm text-gray-600">
                    Receive alerts when crop stress is detected automatically
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">📊 Historical Analysis</h4>
                  <p className="text-sm text-gray-600">
                    Track field performance trends over multiple seasons
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">🎯 Precision Agriculture</h4>
                  <p className="text-sm text-gray-600">
                    Variable rate applications based on satellite insights
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">🤖 AI Recommendations</h4>
                  <p className="text-sm text-gray-600">
                    Get specific action items for each field's unique needs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}