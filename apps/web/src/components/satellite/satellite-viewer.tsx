'use client'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Satellite, Eye, Download, RefreshCw, AlertCircle } from 'lucide-react'
interface SatelliteViewerProps {
  fieldId: string
  fieldName: string
}
interface NDVIData {
  ndvi: number
  ndviClass: string
  healthStatus: string
  captureDate: string
  cloudCoverage: number
  confidence: number
  indices: {
    NDVI: number
    SAVI: number
    EVI: number
    GNDVI: number
    NDWI: number
    NDMI: number
    LAI: number
    FVC: number
  }
  imageUrl?: string
}
export function SatelliteViewer({ fieldId, fieldName }: SatelliteViewerProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ndviData, setNdviData] = useState<NDVIData | null>(null)
  const [showIndices, setShowIndices] = useState(false)
  useEffect(() => {
    fetchNDVIData()
  }, [fieldId])
  const fetchNDVIData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/satellite/live-ndvi?fieldId=${fieldId}`)
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch satellite data')
      }
      const data = await response.json()
      setNdviData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }
  const getHealthColor = (ndvi: number) => {
    if (ndvi >= 0.7) return 'text-green-600'
    if (ndvi >= 0.5) return 'text-yellow-600'
    if (ndvi >= 0.3) return 'text-orange-600'
    return 'text-red-600'
  }
  const getHealthBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent':
        return 'bg-[#F8FAF8] text-green-800'
      case 'good':
        return 'bg-[#F8FAF8] text-green-800'
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800'
      case 'stressed':
        return 'bg-orange-100 text-orange-800'
      case 'poor':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-[#F5F5F5] text-[#1A1A1A]'
    }
  }
  if (loading) {
    return (
      <Card className="border-2">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-3" />
            <p className="text-[#555555]">Loading satellite data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  if (error) {
    return (
      <Card className="border-2">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
            <p className="text-red-600 font-medium">Error loading satellite data</p>
            <p className="text-sm text-[#555555] mt-1">{error}</p>
            <Button onClick={fetchNDVIData} className="mt-4" size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }
  if (!ndviData) {
    return (
      <Card className="border-2">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <Satellite className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-[#555555]">No satellite data available</p>
            <p className="text-sm text-[#555555] mt-1">Data will be available soon</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Satellite Analysis - {fieldName}</CardTitle>
            <CardDescription>
              Captured on {new Date(ndviData.captureDate).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={fetchNDVIData}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            {ndviData.imageUrl && (
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4 mr-1" />
                View Image
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* NDVI Visualization */}
        <div className="bg-gradient-to-r from-red-100 via-yellow-100 via-green-100 to-green-200 rounded-lg h-48 mb-6 relative overflow-hidden">
          <div 
            className="absolute top-0 bottom-0 w-1 bg-black"
            style={{ left: `${ndviData.ndvi * 100}%` }}
          >
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-sm font-medium">
              {ndviData.ndvi.toFixed(2)}
            </div>
          </div>
          <div className="absolute bottom-2 left-2 text-sm text-[#555555]">Poor</div>
          <div className="absolute bottom-2 right-2 text-sm text-[#555555]">Excellent</div>
        </div>
        {/* Health Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <div className="text-sm text-[#555555]">NDVI Score</div>
            <div className={`text-2xl font-bold ${getHealthColor(ndviData.ndvi)}`}>
              {ndviData.ndvi.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-sm text-[#555555]">Health Status</div>
            <Badge className={`mt-1 ${getHealthBadgeColor(ndviData.healthStatus)}`}>
              {ndviData.healthStatus}
            </Badge>
          </div>
          <div>
            <div className="text-sm text-[#555555]">Cloud Cover</div>
            <div className="text-lg font-medium">
              {ndviData.cloudCoverage.toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-sm text-[#555555]">Confidence</div>
            <div className="text-lg font-medium">
              {ndviData.confidence.toFixed(0)}%
            </div>
          </div>
        </div>
        {/* Vegetation Indices */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowIndices(!showIndices)}
            className="w-full justify-between"
          >
            <span>Advanced Vegetation Indices</span>
            <span>{showIndices ? '−' : '+'}</span>
          </Button>
          {showIndices && ndviData.indices && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-[#FAFAF7] rounded-lg">
              {Object.entries(ndviData.indices).map(([key, value]) => (
                <div key={key}>
                  <div className="text-xs text-[#555555]">{key}</div>
                  <div className="text-sm font-medium">{value.toFixed(3)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Analysis Summary */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Analysis Summary</h4>
          <p className="text-sm text-blue-700">
            Field &quot;{fieldName}&quot; shows {ndviData.ndviClass} vegetation density with 
            {ndviData.healthStatus.toLowerCase() === 'excellent' ? ' optimal' : 
             ndviData.healthStatus.toLowerCase() === 'good' ? ' healthy' :
             ndviData.healthStatus.toLowerCase() === 'moderate' ? ' acceptable' :
             ' concerning'} crop health indicators. 
            {ndviData.cloudCoverage > 20 && ' Note: High cloud coverage may affect accuracy.'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}