'use client'
import { DashboardLayout } from '../../../../components/layout/dashboard-layout'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../../../../components/ui/modern-card'
import { Badge } from '../../../../components/ui/badge'
import { Alert, AlertDescription } from '../../../../components/ui/alert'
import { 
  Satellite, Eye, Map, Layers, TrendingUp, 
  Calendar, Zap, Info, CheckCircle, Lightbulb
} from 'lucide-react'
export default function SatelliteImageryGuidePage() {
  return (
    <DashboardLayout>
      <main className="max-w-4xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Satellite className="h-6 w-6 text-sage-700" />
            <span className="text-sage-600">Satellite Monitoring</span>
          </div>
          <h1 className="text-3xl font-bold text-sage-800 mb-4">
            Understanding Satellite Imagery & NDVI Analysis
          </h1>
          <div className="flex items-center gap-4 text-sm text-sage-600">
            <Badge variant="outline">15 min read</Badge>
            <span>•</span>
            <span>Last updated: January 2025</span>
          </div>
        </div>
        {/* Introduction */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardContent className="p-8">
            <p className="text-lg text-sage-700 leading-relaxed mb-4">
              Satellite imagery gives you x-ray vision for your crops. Instead of walking every field every day, 
              you can monitor crop health, spot problems early, and track growth patterns from space - all automatically updated every few days.
            </p>
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <strong>Key Benefit:</strong> Catch crop stress, disease outbreaks, and growth issues 
                before they become major problems - often before you can see them with the naked eye.
              </AlertDescription>
            </Alert>
          </ModernCardContent>
        </ModernCard>
        {/* Satellite Data Sources */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Satellite className="h-5 w-5" />
              Our Satellite Data Sources
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-6">
              <p className="text-sage-700">
                We combine data from multiple satellite constellations to give you the most complete picture:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-sage-800 mb-3">Sentinel-2 (European Space Agency)</h4>
                  <div className="bg-sage-50 p-4 rounded-lg">
                    <ul className="text-sm text-sage-700 space-y-1">
                      <li>• <strong>Resolution:</strong> 10m per pixel</li>
                      <li>• <strong>Frequency:</strong> Every 3-5 days</li>
                      <li>• <strong>Coverage:</strong> Global, free access</li>
                      <li>• <strong>Best for:</strong> Detailed field analysis</li>
                    </ul>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sage-800 mb-3">Landsat 8/9 (NASA/USGS)</h4>
                  <div className="bg-earth-50 p-4 rounded-lg">
                    <ul className="text-sm text-earth-700 space-y-1">
                      <li>• <strong>Resolution:</strong> 30m per pixel</li>
                      <li>• <strong>Frequency:</strong> Every 16 days</li>
                      <li>• <strong>Coverage:</strong> Global, free access</li>
                      <li>• <strong>Best for:</strong> Historical comparisons</li>
                    </ul>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sage-800 mb-3">Planet Labs</h4>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• <strong>Resolution:</strong> 3-5m per pixel</li>
                      <li>• <strong>Frequency:</strong> Daily coverage</li>
                      <li>• <strong>Coverage:</strong> Agricultural regions</li>
                      <li>• <strong>Best for:</strong> Real-time monitoring</li>
                    </ul>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sage-800 mb-3">MODIS (NASA)</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• <strong>Resolution:</strong> 250m per pixel</li>
                      <li>• <strong>Frequency:</strong> Daily coverage</li>
                      <li>• <strong>Coverage:</strong> Global, weather monitoring</li>
                      <li>• <strong>Best for:</strong> Regional trends</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        {/* What Satellites See */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              What Satellites Can See (That You Can't)
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-6">
              <p className="text-sage-700 mb-4">
                Satellites detect light wavelengths beyond human vision, revealing crop health information invisible to the naked eye:
              </p>
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">Red Light (660nm)</h4>
                  <p className="text-red-700 text-sm">
                    Chlorophyll absorbs red light for photosynthesis. Healthy plants absorb more red light, 
                    while stressed plants reflect more (appearing lighter in red imagery).
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Near-Infrared (NIR) (850nm)</h4>
                  <p className="text-green-700 text-sm">
                    Healthy plant cells reflect lots of near-infrared light (invisible to us). 
                    Stressed, diseased, or dying plants reflect much less NIR.
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Short-Wave Infrared (SWIR) (1600nm)</h4>
                  <p className="text-blue-700 text-sm">
                    Sensitive to water content in plants. Drought-stressed crops show up clearly 
                    in SWIR imagery because they contain less water.
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Red Edge (700-740nm)</h4>
                  <p className="text-purple-700 text-sm">
                    The transition zone between red and NIR. Very sensitive to chlorophyll content 
                    and can detect stress before visible symptoms appear.
                  </p>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        {/* NDVI Explained */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              NDVI: Your Crop Health Thermometer
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-sage-800 mb-2">What is NDVI?</h3>
                <p className="text-sage-700 mb-4">
                  NDVI (Normalized Difference Vegetation Index) is like a thermometer for plant health. 
                  It compares how much red and near-infrared light your crops reflect to calculate a health score from -1 to +1.
                </p>
                <div className="bg-sage-50 p-4 rounded-lg">
                  <p className="text-sm font-mono text-sage-700 mb-2">
                    NDVI = (NIR - Red) / (NIR + Red)
                  </p>
                  <p className="text-sm text-sage-600">
                    The math is automatic - you just see the results as easy-to-understand health scores.
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-sage-800 mb-3">NDVI Value Meanings</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <Badge className="bg-green-100 text-green-800 mb-2">0.6 - 0.9: Healthy Vegetation</Badge>
                      <p className="text-sage-700 text-sm">Dense, green, actively growing crops. This is what you want to see.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <Badge className="bg-yellow-100 text-yellow-800 mb-2">0.3 - 0.6: Moderate Vegetation</Badge>
                      <p className="text-sage-700 text-sm">Sparse vegetation, young crops, or mild stress. May need attention.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <Badge className="bg-orange-100 text-orange-800 mb-2">0.1 - 0.3: Sparse Vegetation</Badge>
                      <p className="text-sage-700 text-sm">Very young crops, severe stress, or poor growing conditions.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <Badge className="bg-red-100 text-red-800 mb-2">Below 0.1: No Vegetation</Badge>
                      <p className="text-sage-700 text-sm">Bare soil, water, rocks, or dead vegetation.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        {/* Other Vegetation Indices */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Beyond NDVI: Other Useful Indices
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-6">
              <p className="text-sage-700 mb-4">
                While NDVI is our primary health indicator, we also use specialized indices for specific conditions:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-sage-800 mb-3">NDWI (Water Stress)</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-700 mb-2">
                      <strong>Best for:</strong> Detecting drought stress before visible symptoms
                    </p>
                    <p className="text-sm text-blue-600">
                      Uses short-wave infrared to measure plant water content. 
                      Low values indicate water stress.
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sage-800 mb-3">EVI (Enhanced Vegetation)</h4>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-700 mb-2">
                      <strong>Best for:</strong> Dense canopy areas where NDVI saturates
                    </p>
                    <p className="text-sm text-green-600">
                      More sensitive than NDVI in areas with very dense vegetation. 
                      Reduces background soil influence.
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sage-800 mb-3">SAVI (Soil-Adjusted)</h4>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-sm text-yellow-700 mb-2">
                      <strong>Best for:</strong> Early season when soil is still visible
                    </p>
                    <p className="text-sm text-yellow-600">
                      Reduces soil brightness interference in young crop analysis. 
                      Better for sparse vegetation.
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sage-800 mb-3">GNDVI (Green NDVI)</h4>
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <p className="text-sm text-emerald-700 mb-2">
                      <strong>Best for:</strong> Chlorophyll content and nitrogen status
                    </p>
                    <p className="text-sm text-emerald-600">
                      More sensitive to chlorophyll variations. 
                      Useful for nitrogen deficiency detection.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        {/* Interpreting Satellite Maps */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              How to Read Your Satellite Maps
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-sage-800 mb-3">Color Schemes</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-yellow-500 to-green-500 rounded"></div>
                    <div>
                      <h4 className="font-medium text-sage-700">Red → Yellow → Green</h4>
                      <p className="text-sm text-sage-600">Red = Poor health, Yellow = Moderate, Green = Excellent</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-900 to-blue-300 to-red-500 rounded"></div>
                    <div>
                      <h4 className="font-medium text-sage-700">Blue → Light Blue → Red</h4>
                      <p className="text-sm text-sage-600">Alternative scheme: Dark blue = Poor, Light blue = Good, Red = Excellent</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-sage-800 mb-3">What Patterns Mean</h3>
                <div className="space-y-4">
                  <div className="bg-sage-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-sage-800 mb-2">Uniform High Values</h4>
                    <p className="text-sage-700 text-sm">
                      Field shows consistent green/high NDVI = Healthy, even crop growth. Keep doing what you're doing!
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">Patchy Patterns</h4>
                    <p className="text-yellow-700 text-sm">
                      Irregular spots of low values = Check for pests, disease, nutrient deficiency, or equipment issues during planting/application.
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">Edge Effects</h4>
                    <p className="text-orange-700 text-sm">
                      Lower values around field edges = Often normal due to headland compaction, spray overlap, or shading from trees/structures.
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">Linear Patterns</h4>
                    <p className="text-red-700 text-sm">
                      Straight lines of poor growth = Check planter/sprayer settings, clogged nozzles, or uneven fertilizer application.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        {/* Timing and Frequency */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              When New Images Become Available
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-sage-800 mb-3">Image Update Schedule</h3>
                <div className="space-y-3">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Peak Growing Season (April-September)</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• <strong>New images:</strong> Every 2-5 days (weather permitting)</li>
                      <li>• <strong>Processing time:</strong> 1-2 days after satellite pass</li>
                      <li>• <strong>Cloud coverage:</strong> Only clear images are processed</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Off-Season (October-March)</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• <strong>New images:</strong> Every 7-14 days</li>
                      <li>• <strong>Focus:</strong> Soil conditions, cover crops, residue monitoring</li>
                      <li>• <strong>Analysis:</strong> Preparation for next growing season</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-sage-800 mb-3">Factors Affecting Image Availability</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-sage-400">•</span>
                    <span className="text-sage-700"><strong>Cloud Cover:</strong> Images with {'>'}20% clouds are filtered out for accuracy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sage-400">•</span>
                    <span className="text-sage-700"><strong>Weather Patterns:</strong> Extended cloudy periods may delay updates by 1-2 weeks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sage-400">•</span>
                    <span className="text-sage-700"><strong>Satellite Orbits:</strong> Polar-orbiting satellites may have longer intervals at certain latitudes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sage-400">•</span>
                    <span className="text-sage-700"><strong>Snow/Ice:</strong> Winter coverage makes vegetation analysis impossible</span>
                  </li>
                </ul>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        {/* Limitations */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Understanding Satellite Limitations
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-6">
              <p className="text-sage-700 mb-4">
                Satellite imagery is powerful but has limitations. Understanding these helps you use the data more effectively:
              </p>
              <div className="space-y-4">
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Weather Dependency</h4>
                  <p className="text-yellow-700 text-sm">
                    Clouds block satellites from seeing your crops. During cloudy periods, you may not get updates for 1-2 weeks.
                  </p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-orange-800 mb-2">Resolution Limits</h4>
                  <p className="text-orange-700 text-sm">
                    Even high-resolution satellites can't see individual plants. Small-scale issues (single pest infestations) may be missed.
                  </p>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold text-red-800 mb-2">Time Lag</h4>
                  <p className="text-red-700 text-sm">
                    Satellite data is 1-3 days old by the time you see it. For rapidly developing issues, field scouting is still essential.
                  </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Early Season Challenges</h4>
                  <p className="text-blue-700 text-sm">
                    Young crops with sparse canopy coverage may give mixed signals due to soil interference.
                  </p>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        {/* Final Tips */}
        <Alert>
          <Satellite className="h-4 w-4" />
          <AlertDescription>
            <strong>Pro Tip:</strong> Use satellite imagery as your early warning system, not your only monitoring tool. 
            When satellites show potential problems, always follow up with field scouting to confirm the issue and 
            determine the best response. The combination of satellite intelligence and your farming experience is unbeatable!
          </AlertDescription>
        </Alert>
      </main>
    </DashboardLayout>
  )
}