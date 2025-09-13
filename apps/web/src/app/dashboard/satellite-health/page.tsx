'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Navbar } from '../../../components/navigation/navbar'
import { FieldHealthMonitor } from '../../../components/satellite/field-health-monitor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { Badge } from '../../../components/ui/badge'
import { Alert, AlertDescription } from '../../../components/ui/alert'
import { 
  Satellite, TrendingUp, MapPin, Calendar, BarChart3,
  AlertTriangle, CheckCircle, RefreshCw, Settings, Download
} from 'lucide-react'
import { ensureArray } from '../../../lib/utils'

interface Farm {
  id: string
  name: string
  totalArea: number
  fieldCount: number
}

export default function SatelliteHealthPage() {
  const { data: session } = useSession()
  const [farms, setFarms] = useState<Farm[]>([])
  const [selectedFarmId, setSelectedFarmId] = useState<string>('')
  const [isLoadingFarms, setIsLoadingFarms] = useState(true)

  // Fetch user's farms
  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const response = await fetch('/api/farms')
        if (response.ok) {
          const data = await response.json()
          setFarms(ensureArray(data.farms))
          if (data.farms && data.farms.length > 0) {
            setSelectedFarmId(data.farms[0].id)
          }
        }
      } catch (error) {
        console.error('Error fetching farms:', error)
      } finally {
        setIsLoadingFarms(false)
      }
    }

    if (session) {
      fetchFarms()
    }
  }, [session])

  const selectedFarm = farms.find(farm => farm.id === selectedFarmId)

  const stats = [
    {
      title: 'Fields Monitored',
      value: selectedFarm?.fieldCount || 0,
      icon: MapPin,
      color: 'text-blue-600'
    },
    {
      title: 'Total Area',
      value: `${selectedFarm?.totalArea || 0} acres`,
      icon: BarChart3,
      color: 'text-green-600'
    },
    {
      title: 'Analysis Frequency',
      value: 'Every 16 days',
      icon: Calendar,
      color: 'text-purple-600'
    },
    {
      title: 'Data Source',
      value: 'Sentinel-2',
      icon: Satellite,
      color: 'text-indigo-600'
    }
  ]

  if (!session) {
    return (
      <div className="min-h-screen bg-agricultural">
        <Navbar />
        <div className="max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please sign in to access satellite health monitoring.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-agricultural">
      <Navbar />
      
      <div className="max-w-7xl mx-auto pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Satellite Health Monitoring
              </h1>
              <p className="text-white/80">
                Real-time crop health analysis using satellite imagery and AI
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Farm Selection */}
        {farms.length > 0 && (
          <Card className="mb-8 bg-white/10 backdrop-blur border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Select Farm</CardTitle>
              <CardDescription className="text-white/70">
                Choose which farm to monitor for satellite health analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Select value={selectedFarmId} onValueChange={setSelectedFarmId}>
                  <SelectTrigger className="w-64 bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select a farm..." />
                  </SelectTrigger>
                  <SelectContent>
                    {farms.map((farm) => (
                      <SelectItem key={farm.id} value={farm.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{farm.name}</span>
                          <Badge variant="secondary" className="ml-2">
                            {farm.fieldCount} fields
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedFarm && (
                  <div className="text-white/80 text-sm">
                    {selectedFarm.totalArea} acres • {selectedFarm.fieldCount} fields
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm font-medium">{stat.title}</p>
                    <p className="text-white text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Key Features Info */}
        <Card className="mb-8 bg-white/10 backdrop-blur border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Satellite className="h-5 w-5 mr-2" />
              Satellite Analysis Capabilities
            </CardTitle>
            <CardDescription className="text-white/70">
              Advanced vegetation analysis powered by Sentinel Hub and AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">NDVI Analysis</h3>
                <p className="text-white/70 text-sm">
                  Normalized Difference Vegetation Index for crop health assessment
                </p>
              </div>
              
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">Stress Detection</h3>
                <p className="text-white/70 text-sm">
                  Early detection of drought, disease, and nutrient deficiencies
                </p>
              </div>
              
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">AI Recommendations</h3>
                <p className="text-white/70 text-sm">
                  Actionable insights and management recommendations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Field Health Monitor Component */}
        {selectedFarmId ? (
          <div className="bg-white/5 backdrop-blur rounded-xl p-6 border border-white/10">
            <FieldHealthMonitor 
              farmId={selectedFarmId}
              autoRefresh={true}
              refreshInterval={300000} // 5 minutes
            />
          </div>
        ) : (
          <Card className="bg-white/10 backdrop-blur border-white/20">
            <CardContent className="p-12 text-center">
              <Satellite className="h-16 w-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No Farm Selected
              </h3>
              <p className="text-white/70">
                {isLoadingFarms 
                  ? 'Loading your farms...' 
                  : farms.length === 0 
                    ? 'Create a farm first to start monitoring field health.'
                    : 'Select a farm above to view satellite health monitoring.'
                }
              </p>
              {!isLoadingFarms && farms.length === 0 && (
                <Button 
                  className="mt-4 bg-white/20 hover:bg-white/30 text-white border-white/20"
                  onClick={() => window.location.href = '/farms/create'}
                >
                  Create Your First Farm
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Analysis Information */}
        <Card className="mt-8 bg-white/10 backdrop-blur border-white/20">
          <CardHeader>
            <CardTitle className="text-white">How It Works</CardTitle>
            <CardDescription className="text-white/70">
              Understanding satellite-based field health monitoring
            </CardDescription>
          </CardHeader>
          <CardContent className="text-white/80 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-white mb-2">Data Collection</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Sentinel-2 satellite imagery (10m resolution)</li>
                  <li>• 16-day revisit cycle for consistent monitoring</li>
                  <li>• Cloud-filtered imagery for accurate analysis</li>
                  <li>• Multi-spectral band analysis (RGB, NIR, Red Edge)</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-white mb-2">Analysis Metrics</h4>
                <ul className="space-y-1 text-sm">
                  <li>• NDVI: Vegetation density and health</li>
                  <li>• Stress indicators: Drought, disease, nutrients</li>
                  <li>• Vegetation zones: Healthy, moderate, stressed</li>
                  <li>• Trend analysis: Improvement or decline patterns</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-white/5 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Benefits</h4>
              <p className="text-sm">
                Early detection of crop stress allows for timely intervention, potentially saving 
                entire harvests. Monitor field variability to optimize input application and improve 
                overall farm efficiency. Track seasonal trends to make data-driven management decisions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}