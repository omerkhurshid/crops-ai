import { UnifiedFarmDashboard } from '../../../components/precision/unified-farm-dashboard'

export default function PrecisionAgricultureDemoPage() {
  // Demo farm location (Central Valley, California - agricultural area)
  const farmLocation = {
    lat: 36.7783,
    lng: -119.4179
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Crops.AI Demo</h1>
              <p className="text-gray-600">Precision Agriculture Intelligence Platform</p>
            </div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Live Demo
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-6">
        <UnifiedFarmDashboard 
          farmId="demo-farm-precision-ag"
          farmLocation={farmLocation}
        />
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="container mx-auto py-6 text-center text-gray-600">
          <p className="mb-2">
            Experience the full power of AI-driven precision agriculture
          </p>
          <p className="text-sm">
            🛰️ Real-time satellite monitoring • 🤖 AI crop stress detection • 🎯 Variable-rate recommendations • 📊 ROI analysis
          </p>
        </div>
      </div>
    </div>
  )
}