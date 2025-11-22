'use client'
import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
interface MapFieldSelectorProps {
  fieldId: string
  onBoundariesDetected: (boundaries: Array<{ lat: number; lng: number }>) => void
  onClose: () => void
}
export function MapFieldSelector({ fieldId, onBoundariesDetected, onClose }: MapFieldSelectorProps) {
  const [coordinates, setCoordinates] = useState({
    centerLat: '',
    centerLng: '',
    radius: '1000' // meters
  })
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectedFields, setDetectedFields] = useState<any[]>([])
  const [selectedField, setSelectedField] = useState<number | null>(null)
  const detectBoundaries = async () => {
    if (!coordinates.centerLat || !coordinates.centerLng) {
      alert('Please enter coordinates for your field location')
      return
    }
    setIsDetecting(true)
    try {
      const lat = parseFloat(coordinates.centerLat)
      const lng = parseFloat(coordinates.centerLng)
      const radiusKm = parseFloat(coordinates.radius) / 1000
      // Create bounding box around the center point
      const bbox = {
        west: lng - radiusKm * 0.01,
        south: lat - radiusKm * 0.01,
        east: lng + radiusKm * 0.01,
        north: lat + radiusKm * 0.01
      }
      const response = await fetch('/api/satellite/boundaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'detect',
          bbox,
          date: new Date().toISOString().split('T')[0], // Today's date
          options: {
            method: 'edge-detection',
            sensitivity: 'medium',
            minFieldSize: 1,
            maxFieldSize: 500,
            smoothing: true,
            mergeAdjacent: true,
            excludeWater: true,
            excludeUrban: true
          }
        })
      })
      const result = await response.json()
      if (result.success && result.data.boundaries) {
        setDetectedFields(result.data.boundaries)
      } else {
        throw new Error(result.message || 'Failed to detect boundaries')
      }
    } catch (error) {
      console.error('Boundary detection failed:', error)
      alert('Failed to detect field boundaries. Please try different coordinates or contact support.')
    } finally {
      setIsDetecting(false)
    }
  }
  const selectField = (index: number) => {
    setSelectedField(index)
  }
  const confirmSelection = () => {
    if (selectedField !== null && detectedFields[selectedField]) {
      const field = detectedFields[selectedField]
      // Convert polygon coordinates to lat/lng array
      if (field.geometry && field.geometry.coordinates && field.geometry.coordinates[0]) {
        const coordinates = field.geometry.coordinates[0].map((coord: number[]) => ({
          lat: coord[1],
          lng: coord[0]
        }))
        onBoundariesDetected(coordinates)
      }
    }
    onClose()
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Detect Field Boundaries</CardTitle>
          <CardDescription>
            Use satellite imagery to automatically detect field boundaries in your area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Step 1: Enter Location */}
            <div>
              <h4 className="font-medium mb-4">1. Enter Field Location</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="center-lat">Latitude</Label>
                  <Input
                    id="center-lat"
                    type="number"
                    step="any"
                    placeholder="e.g., 40.7128"
                    value={coordinates.centerLat}
                    onChange={(e) => setCoordinates(prev => ({ ...prev, centerLat: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="center-lng">Longitude</Label>
                  <Input
                    id="center-lng"
                    type="number"
                    step="any"
                    placeholder="e.g., -74.0060"
                    value={coordinates.centerLng}
                    onChange={(e) => setCoordinates(prev => ({ ...prev, centerLng: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="radius">Search Radius (m)</Label>
                  <Input
                    id="radius"
                    type="number"
                    placeholder="1000"
                    value={coordinates.radius}
                    onChange={(e) => setCoordinates(prev => ({ ...prev, radius: e.target.value }))}
                  />
                </div>
              </div>
              <div className="mt-4">
                <Button 
                  onClick={detectBoundaries}
                  disabled={isDetecting || !coordinates.centerLat || !coordinates.centerLng}
                  className="w-full md:w-auto"
                >
                  {isDetecting ? 'Analyzing Satellite Images...' : 'Detect Field Boundaries'}
                </Button>
              </div>
            </div>
            {/* Step 2: Select Detected Field */}
            {detectedFields.length > 0 && (
              <div>
                <h4 className="font-medium mb-4">2. Select Your Field</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                  {detectedFields.map((field, index) => (
                    <div
                      key={index}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedField === index
                          ? 'border-crops-green-500 bg-crops-green-50'
                          : 'border-[#F3F4F6] hover:border-[#F3F4F6]'
                      }`}
                      onClick={() => selectField(index)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">Field {index + 1}</h5>
                        <span className="text-sm text-[#555555]">
                          {Math.round(field.confidence * 100)}% confidence
                        </span>
                      </div>
                      <div className="text-sm text-[#555555] space-y-1">
                        <div>Area: {field.area?.toFixed(2)} hectares</div>
                        <div>Shape: {field.characteristics?.shape || 'Unknown'}</div>
                        {field.landUse && (
                          <div>Land use: {field.landUse}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {detectedFields.length === 0 && !isDetecting && coordinates.centerLat && coordinates.centerLng && (
              <div className="text-center py-8 text-[#555555]">
                <p>No field boundaries detected in this area.</p>
                <p className="text-sm mt-2">Try adjusting the coordinates or increasing the search radius.</p>
              </div>
            )}
            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={confirmSelection}
                disabled={selectedField === null}
                className="bg-crops-green-600 hover:bg-crops-green-700"
              >
                Use Selected Field
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}