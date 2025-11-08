'use client'

import { useState, useEffect, useCallback } from 'react'
import { GoogleMap, LoadScript, OverlayView, InfoWindow } from '@react-google-maps/api'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../ui/modern-card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { 
  Satellite, 
  MapPin, 
  Calendar,
  Eye,
  Layers,
  BarChart3,
  Info,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'

// Real coordinates for a corn field in Central Nebraska
const DEMO_FIELD_LOCATION = {
  center: { lat: 41.305150, lng: -98.161795 },
  name: "Nebraska Corn Field - Central Plains",
  address: "Central Nebraska",
  acres: 160,
  crop: "Corn (Pioneer P1366AM)"
}

// Google Maps configuration
const mapContainerStyle = {
  width: '100%',
  height: '400px'
}

const mapOptions = {
  zoom: 15,
  center: DEMO_FIELD_LOCATION.center,
  mapTypeId: 'satellite' as google.maps.MapTypeId,
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  scaleControl: true,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  gestureHandling: 'cooperative'
}

// Field boundary coordinates (approximate rectangular field) - Central Nebraska
const fieldBoundary = [
  { lat: 41.3061, lng: -98.1635 }, // Northwest corner
  { lat: 41.3061, lng: -98.1600 }, // Northeast corner  
  { lat: 41.3041, lng: -98.1600 }, // Southeast corner
  { lat: 41.3041, lng: -98.1635 }, // Southwest corner
  { lat: 41.3061, lng: -98.1635 }  // Close polygon
]

interface RealGoogleMapsNDVIProps {
  className?: string
}

export function RealGoogleMapsNDVI({ className = '' }: RealGoogleMapsNDVIProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [ndviData, setNdviData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showNDVIOverlay, setShowNDVIOverlay] = useState(true)
  const [selectedDate, setSelectedDate] = useState('2024-08-01')
  const [fieldPolygon, setFieldPolygon] = useState<google.maps.Polygon | null>(null)
  const [showInfo, setShowInfo] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [cacheStatus, setCacheStatus] = useState<'cached' | 'live' | 'refreshing'>('cached')

  // Enhanced NDVI data with realistic stats for Nebraska corn field
  const getNDVIDataForDate = useCallback((date: string) => {
    const seasonalData: { [key: string]: any } = {
      '2024-05-15': { // Early season
        averageNDVI: 0.35,
        maxNDVI: 0.48,
        minNDVI: 0.22,
        uniformity: 78,
        stage: 'V4 - Four Leaf',
        yieldProjection: 165,
        healthStatus: 'Good',
        recommendations: ['Monitor emergence uniformity', 'Consider side-dress nitrogen']
      },
      '2024-06-01': { // Early vegetative
        averageNDVI: 0.52,
        maxNDVI: 0.65,
        minNDVI: 0.41,
        uniformity: 82,
        stage: 'V8 - Eight Leaf',
        yieldProjection: 172,
        healthStatus: 'Very Good',
        recommendations: ['Apply herbicide if needed', 'Scout for insect pressure']
      },
      '2024-06-15': { // Mid vegetative
        averageNDVI: 0.68,
        maxNDVI: 0.78,
        minNDVI: 0.58,
        uniformity: 85,
        stage: 'V12 - Twelve Leaf',
        yieldProjection: 178,
        healthStatus: 'Excellent',
        recommendations: ['Continue nutrient monitoring', 'Prepare for tasseling']
      },
      '2024-07-01': { // Pre-tassel
        averageNDVI: 0.82,
        maxNDVI: 0.91,
        minNDVI: 0.73,
        uniformity: 88,
        stage: 'VT - Tasseling',
        yieldProjection: 185,
        healthStatus: 'Excellent',
        recommendations: ['Monitor pollination', 'Ensure adequate moisture']
      },
      '2024-07-15': { // Peak growth
        averageNDVI: 0.89,
        maxNDVI: 0.95,
        minNDVI: 0.81,
        uniformity: 91,
        stage: 'R1 - Silking',
        yieldProjection: 192,
        healthStatus: 'Outstanding',
        recommendations: ['Critical irrigation period', 'Monitor heat stress']
      },
      '2024-08-01': { // Grain fill
        averageNDVI: 0.85,
        maxNDVI: 0.93,
        minNDVI: 0.76,
        uniformity: 89,
        stage: 'R3 - Milk Stage',
        yieldProjection: 189,
        healthStatus: 'Excellent',
        recommendations: ['Continue irrigation', 'Scout for late season pests']
      },
      '2024-08-15': { // Mid grain fill
        averageNDVI: 0.78,
        maxNDVI: 0.87,
        minNDVI: 0.69,
        uniformity: 86,
        stage: 'R4 - Dough Stage',
        yieldProjection: 186,
        healthStatus: 'Very Good',
        recommendations: ['Monitor moisture stress', 'Plan harvest timing']
      },
      '2024-09-01': { // Late grain fill
        averageNDVI: 0.68,
        maxNDVI: 0.78,
        minNDVI: 0.58,
        uniformity: 83,
        stage: 'R5 - Dent Stage',
        yieldProjection: 182,
        healthStatus: 'Good',
        recommendations: ['Monitor grain moisture', 'Prepare harvest equipment']
      },
      '2024-09-15': { // Maturity
        averageNDVI: 0.54,
        maxNDVI: 0.64,
        minNDVI: 0.44,
        uniformity: 80,
        stage: 'R6 - Physiological Maturity',
        yieldProjection: 180,
        healthStatus: 'Mature',
        recommendations: ['Wait for proper moisture', 'Schedule harvest']
      },
      '2024-10-01': { // Harvest ready
        averageNDVI: 0.38,
        maxNDVI: 0.48,
        minNDVI: 0.28,
        uniformity: 75,
        stage: 'Harvest Ready',
        yieldProjection: 178,
        healthStatus: 'Ready to Harvest',
        recommendations: ['Harvest at 20-22% moisture', 'Monitor weather conditions']
      }
    }
    
    return seasonalData[date] || seasonalData['2024-08-01']
  }, [])

  // Load NDVI data with simplified caching
  const loadNDVIData = useCallback(async (date: string, forceRefresh = false) => {
    setIsLoading(true)
    setCacheStatus('refreshing')
    
    // Check if we're in browser environment
    const isClient = typeof window !== 'undefined'
    
    // Simplified cache check - only use cache for very recent data
    let cachedData: string | null = null
    let cacheTime: string | null = null
    
    if (isClient && !forceRefresh) {
      try {
        const cacheKey = `ndvi-${date}`
        cachedData = sessionStorage.getItem(cacheKey) // Use sessionStorage instead
        cacheTime = sessionStorage.getItem(`${cacheKey}-time`)
        
        // Use cache if less than 30 minutes old
        if (cachedData && cacheTime) {
          const age = Date.now() - parseInt(cacheTime)
          if (age < 30 * 60 * 1000) { // 30 minutes
            setTimeout(() => {
              setNdviData(JSON.parse(cachedData!))
              setLastUpdate(new Date(parseInt(cacheTime!)))
              setCacheStatus('cached')
              setIsLoading(false)
            }, 300) // Faster loading for UX
            return
          }
        }
      } catch (error) {
        console.log('Cache read error, proceeding with fresh data')
      }
    }
    
    // Simplified loading - use demo data directly for now
    setTimeout(() => {
      try {
        // Use enhanced realistic data directly
        const data = {
          ...getNDVIDataForDate(date),
          date: date,
          source: 'demo',
          location: DEMO_FIELD_LOCATION.address
        }
        
        // Cache the demo data if in browser
        if (isClient) {
          try {
            const now = Date.now()
            const cacheKey = `ndvi-${date}`
            sessionStorage.setItem(cacheKey, JSON.stringify(data))
            sessionStorage.setItem(`${cacheKey}-time`, now.toString())
            setLastUpdate(new Date(now))
          } catch (error) {
            console.log('Cache write error, continuing without cache')
          }
        }
        
        setCacheStatus('cached')
        setNdviData(data)
      } catch (error) {
        console.error('Error loading NDVI data:', error)
        // Fallback to basic data
        setNdviData({
          averageNDVI: 0.82,
          maxNDVI: 0.95,
          minNDVI: 0.65,
          uniformity: 85,
          stage: 'R3 - Milk Stage',
          yieldProjection: 185,
          healthStatus: 'Excellent',
          source: 'fallback'
        })
        setCacheStatus('cached')
      } finally {
        setIsLoading(false)
      }
    }, 800) // Reduced delay
  }, [getNDVIDataForDate])

  // Initialize map and field boundary
  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
    
    // Create field boundary polygon
    const polygon = new google.maps.Polygon({
      paths: fieldBoundary,
      strokeColor: '#00FF00',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: showNDVIOverlay ? '#00FF00' : 'transparent',
      fillOpacity: showNDVIOverlay ? 0.35 : 0,
    })
    
    polygon.setMap(map)
    setFieldPolygon(polygon)
    
    // Load initial NDVI data
    loadNDVIData(selectedDate)
  }, [selectedDate, showNDVIOverlay, loadNDVIData])

  // Update field polygon when NDVI overlay toggle changes
  useEffect(() => {
    if (fieldPolygon && ndviData) {
      const ndviValue = ndviData.averageNDVI || 0.82
      
      // Color field based on NDVI value
      let fillColor = '#FF0000' // Red for low NDVI
      if (ndviValue > 0.7) fillColor = '#00FF00' // Green for high NDVI
      else if (ndviValue > 0.5) fillColor = '#FFFF00' // Yellow for medium NDVI
      else if (ndviValue > 0.3) fillColor = '#FFA500' // Orange for low-medium NDVI
      
      fieldPolygon.setOptions({
        fillColor: showNDVIOverlay ? fillColor : 'transparent',
        fillOpacity: showNDVIOverlay ? 0.35 : 0,
        strokeColor: showNDVIOverlay ? fillColor : '#00FF00'
      })
    }
  }, [fieldPolygon, ndviData, showNDVIOverlay])

  // Update NDVI data when date changes
  useEffect(() => {
    if (map) {
      loadNDVIData(selectedDate)
    }
  }, [selectedDate, map, loadNDVIData])

  const refreshNDVIData = () => {
    // Clear cache for current date
    if (typeof window !== 'undefined') {
      try {
        const cacheKey = `ndvi-${selectedDate}`
        sessionStorage.removeItem(cacheKey)
        sessionStorage.removeItem(`${cacheKey}-time`)
      } catch (error) {
        console.log('Cache clear error:', error)
      }
    }
    loadNDVIData(selectedDate, true) // Force refresh
  }

  // Clear all NDVI cache on component mount to prevent stale data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Clear any old NDVI cache data
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('ndvi-')) {
            sessionStorage.removeItem(key)
          }
        })
      } catch (error) {
        console.log('Cache cleanup error:', error)
      }
    }
  }, [])

  const availableDates = [
    '2024-06-15', // V12 - Mid vegetative
    '2024-07-15', // R1 - Peak growth/Silking
    '2024-08-15', // R4 - Mid grain fill (current)
    '2024-09-15', // R6 - Maturity
    '2024-10-01'  // Harvest ready
  ]

  return (
    <ModernCard variant="floating" className={`h-full ${className}`}>
      <ModernCardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Satellite className="h-5 w-5 text-green-600" />
            <ModernCardTitle className="text-lg">Live Satellite NDVI Analysis</ModernCardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={
              cacheStatus === 'live' ? 'bg-green-100 text-green-800' :
              cacheStatus === 'cached' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }>
              {cacheStatus === 'live' ? 'Live Data' :
               cacheStatus === 'cached' ? 'Cached Data' : 'Updating...'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNDVIOverlay(!showNDVIOverlay)}
            >
              <Layers className="h-4 w-4 mr-1" />
              NDVI {showNDVIOverlay ? 'ON' : 'OFF'}
            </Button>
          </div>
        </div>
      </ModernCardHeader>
      
      <ModernCardContent className="space-y-4">
        {/* Field Information */}
        <div className="bg-sage-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="h-4 w-4 text-sage-600" />
            <span className="font-medium text-sage-800">{DEMO_FIELD_LOCATION.name}</span>
          </div>
          <div className="text-sm text-sage-600">
            {DEMO_FIELD_LOCATION.address} • {DEMO_FIELD_LOCATION.acres} acres • {DEMO_FIELD_LOCATION.crop}
          </div>
        </div>

        {/* Date Selection */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-600" />
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {availableDates.map(date => (
              <option key={date} value={date}>
                {new Date(date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshNDVIData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Google Maps with NDVI Overlay */}
        <div className="relative">
          {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
            <LoadScript 
              googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
              loadingElement={
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                    <div className="text-sm text-gray-600">Loading Google Maps...</div>
                  </div>
                </div>
              }
              onError={(error) => {
                console.error('Google Maps loading error:', error)
              }}
            >
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={mapOptions.zoom}
                center={mapOptions.center}
                options={mapOptions}
                onLoad={onMapLoad}
              >
                {/* Field Info Window */}
                {showInfo && ndviData && (
                  <InfoWindow
                    position={DEMO_FIELD_LOCATION.center}
                    onCloseClick={() => setShowInfo(false)}
                  >
                    <div className="p-2 max-w-xs">
                      <h3 className="font-medium text-gray-800 mb-2">Field Analysis</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Average NDVI:</span>
                          <span className="font-medium text-green-600">
                            {(ndviData.averageNDVI || 0.82).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Max NDVI:</span>
                          <span className="font-medium">{(ndviData.maxNDVI || 0.95).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Min NDVI:</span>
                          <span className="font-medium">{(ndviData.minNDVI || 0.65).toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-2">
                          Data from Sentinel-2 satellite
                        </div>
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </LoadScript>
          ) : (
            <div className="h-96 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center border-2 border-dashed border-green-300">
              <div className="text-center p-6">
                <Satellite className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <div className="text-lg font-semibold text-green-800 mb-2">NDVI Satellite Analysis</div>
                <div className="text-sm text-green-700 mb-4">
                  Interactive satellite mapping available with Google Maps API
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-xs text-green-600 border border-green-200">
                  <div className="font-semibold mb-1">Current Analysis:</div>
                  <div>• Field: {DEMO_FIELD_LOCATION.name}</div>
                  <div>• NDVI: {(ndviData?.averageNDVI || 0.82).toFixed(2)} (Excellent)</div>
                  <div>• Yield Projection: {ndviData?.yieldProjection || 185} bu/acre</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced NDVI Analysis Results */}
        {ndviData && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {ndviData.averageNDVI.toFixed(2)}
                </div>
                <div className="text-xs text-gray-600">Avg NDVI</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {ndviData.maxNDVI.toFixed(2)}
                </div>
                <div className="text-xs text-gray-600">Max NDVI</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {ndviData.uniformity}%
                </div>
                <div className="text-xs text-gray-600">Uniformity</div>
              </div>
            </div>
            
            {/* Crop Stage and Yield Projection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                <div className="text-sm font-medium text-orange-800">{ndviData.stage}</div>
                <div className="text-xs text-gray-600 mt-1">Growth Stage</div>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg">
                <div className="text-lg font-bold text-emerald-600">{ndviData.yieldProjection} bu/ac</div>
                <div className="text-xs text-gray-600">Yield Projection</div>
              </div>
            </div>
          </div>
        )}

        {/* Professional AI Insights & Actions */}
        {ndviData && (
          <div className="space-y-4">
            {/* Field Performance Analysis */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <h5 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Field Performance Analysis
              </h5>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="bg-white/60 p-3 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Health Status</div>
                  <div className="font-semibold text-green-700">{ndviData.healthStatus}</div>
                </div>
                <div className="bg-white/60 p-3 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Projected Revenue</div>
                  <div className="font-semibold text-green-700">
                    ${((ndviData.yieldProjection * 4.25 * 160) / 1000).toFixed(0)}k
                  </div>
                </div>
              </div>
              <div className="text-sm text-green-700">
                <div className="flex justify-between items-center">
                  <span>Field uniformity benchmark:</span>
                  <span className="font-medium">{ndviData.uniformity}% (Above average)</span>
                </div>
              </div>
            </div>

            {/* Actionable Recommendations */}
            {ndviData.recommendations && ndviData.recommendations.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Priority Actions - Next 7 Days
                </h5>
                <div className="space-y-3">
                  {ndviData.recommendations.map((rec: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 bg-white/60 p-3 rounded-lg">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-blue-700">{idx + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-blue-800">{rec}</div>
                        <div className="text-xs text-blue-600 mt-1">
                          {idx === 0 && "Critical timing for optimal yield"}
                          {idx === 1 && "Recommended within 5-7 days"}
                          {idx === 2 && "Weather-dependent activity"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk Assessment */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200">
              <h5 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Risk Assessment & Alerts
              </h5>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-white/60 p-2 rounded">
                  <span className="text-sm text-orange-700">Disease Pressure</span>
                  <Badge className="bg-green-100 text-green-800 text-xs">Low</Badge>
                </div>
                <div className="flex items-center justify-between bg-white/60 p-2 rounded">
                  <span className="text-sm text-orange-700">Moisture Stress</span>
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">Monitor</Badge>
                </div>
                <div className="flex items-center justify-between bg-white/60 p-2 rounded">
                  <span className="text-sm text-orange-700">Pest Activity</span>
                  <Badge className="bg-green-100 text-green-800 text-xs">Normal</Badge>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Cache and Update Info */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <Eye className="h-3 w-3" />
              <span>Sentinel-2 • 10m resolution • {ndviData?.source === 'live' ? 'Live API' : 'Enhanced Demo'}</span>
            </div>
            {lastUpdate && (
              <div className="text-right">
                <div>Updated: {lastUpdate.toLocaleTimeString()}</div>
                <div className="text-xs">Cache: {Math.round((Date.now() - lastUpdate.getTime()) / 60000)}min ago</div>
              </div>
            )}
          </div>
        </div>

      </ModernCardContent>
    </ModernCard>
  )
}