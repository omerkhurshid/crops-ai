'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { MapPin, Satellite, CheckCircle, ArrowRight } from 'lucide-react'
import { GoogleMapsFieldEditor } from '../farm/google-maps-field-editor'
import { FieldHealthMonitor } from './field-health-monitor'
import { Alert, AlertDescription } from '../ui/alert'
import { Progress } from '../ui/progress'
type WorkflowDemoProps = {
  farmLocation: { lat: number; lng: number }
  onComplete?: (fields: any[]) => void
}
const WorkflowDemo: React.FC<WorkflowDemoProps> = ({ farmLocation, onComplete }) => {
  const [currentStep, setCurrentStep] = React.useState(1)
  const [definedFields, setDefinedFields] = React.useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [analysisComplete, setAnalysisComplete] = React.useState(false)
  const handleFieldsDetected = async (fields: any[]) => {
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
          setAnalysisComplete(true)
          setCurrentStep(3)
        }
      } catch (error) {
        console.error('Analysis failed:', error)
      } finally {
        setIsAnalyzing(false)
      }
      if (onComplete) {
        onComplete(fields)
      }
    }
  }
  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Satellite className="h-5 w-5 text-blue-600" />
            Interactive Farm-to-Satellite Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${currentStep >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${currentStep >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${currentStep >= 3 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
              3
            </div>
          </div>
          <Progress value={(currentStep - 1) * 50} className="mb-4" />
          <p className="text-center text-sm text-gray-600">
            Step {currentStep}: {currentStep === 1 ? 'Draw Field Boundaries' : currentStep === 2 ? 'Satellite Analysis' : 'View Results'}
          </p>
        </CardContent>
      </Card>
      {/* Step 1: Field Drawing */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Define Field Boundaries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <GoogleMapsFieldEditor
                farmLocation={farmLocation}
                onFieldsDetected={handleFieldsDetected}
              />
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-3">
                  Or try the quick demo with pre-defined fields:
                </p>
                <Button 
                  variant="outline"
                  onClick={() => handleFieldsDetected([
                    {
                      id: `temp-field-${Date.now()}-1`,
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
                      id: `temp-field-${Date.now()}-2`,
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
                  Quick Demo with Sample Fields
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Step 2: Analysis Progress */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Satellite Analysis</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            {isAnalyzing ? (
              <div className="space-y-4">
                <div className="animate-pulse">
                  <Satellite className="h-12 w-12 mx-auto text-blue-600" />
                </div>
                <p className="text-lg font-semibold">Processing Satellite Data</p>
                <p className="text-gray-600">Analyzing {definedFields.length} fields with Sentinel Hub</p>
                <Progress value={75} className="max-w-md mx-auto" />
              </div>
            ) : analysisComplete ? (
              <div className="space-y-4">
                <CheckCircle className="h-12 w-12 mx-auto text-green-600" />
                <p className="text-lg font-semibold text-green-800">Analysis Complete!</p>
                <Button onClick={() => setCurrentStep(3)} className="bg-sage-600 hover:bg-sage-700">
                  View Results
                </Button>
              </div>
            ) : (
              <p className="text-gray-600">Waiting for field definition...</p>
            )}
          </CardContent>
        </Card>
      )}
      {/* Step 3: Results */}
      {currentStep === 3 && analysisComplete && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Field Health Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="border-green-200 bg-green-50 mb-6">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Success!</strong> Your {definedFields.length} fields are now being monitored with AI-powered satellite analysis.
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {definedFields.map((field) => (
                  <div key={field.id} className="p-4 border rounded-lg">
                    <h4 className="font-semibold">{field.name}</h4>
                    <p className="text-sm text-gray-600">{field.area.toFixed(1)} acres</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Analysis Complete</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <FieldHealthMonitor 
            fieldIds={definedFields.map(f => f.id)}
            autoRefresh={true}
            refreshInterval={300000}
          />
        </div>
      )}
    </div>
  )
}
export { WorkflowDemo }