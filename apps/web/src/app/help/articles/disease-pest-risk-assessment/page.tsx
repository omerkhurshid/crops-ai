'use client'

import { DashboardLayout } from '../../../../components/layout/dashboard-layout'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernCardTitle } from '../../../../components/ui/modern-card'
import { Badge } from '../../../../components/ui/badge'
import { Alert, AlertDescription } from '../../../../components/ui/alert'
import { 
  Bug, Shield, AlertTriangle, Thermometer, Droplets,
  Eye, TrendingUp, CheckCircle, Clock, Lightbulb, Target
} from 'lucide-react'

export default function DiseasePestRiskAssessmentPage() {

  return (
    <DashboardLayout>
      <main className="max-w-4xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Bug className="h-6 w-6 text-sage-700" />
            <span className="text-sage-600">Disease & Pest Management</span>
          </div>
          
          <h1 className="text-3xl font-bold text-sage-800 mb-4">
            Disease & Pest Risk Assessment Logic
          </h1>
          
          <div className="flex items-center gap-4 text-sm text-sage-600">
            <Badge variant="outline">14 min read</Badge>
            <span>•</span>
            <span>Last updated: January 2025</span>
          </div>
        </div>

        {/* Introduction */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardContent className="p-8">
            <p className="text-lg text-sage-700 leading-relaxed mb-4">
              Our AI continuously monitors weather conditions, crop growth stages, and historical patterns to predict 
              disease and pest pressure before problems become visible. This gives you time to take preventive action 
              or prepare targeted treatments.
            </p>
            
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <strong>Key Benefit:</strong> Prevent major crop losses by acting on early warnings. 
                Most diseases and pests are much easier (and cheaper) to control when caught early.
              </AlertDescription>
            </Alert>
          </ModernCardContent>
        </ModernCard>

        {/* How Risk Assessment Works */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              How Our Risk Assessment System Works
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-6">
              <p className="text-sage-700">
                Every 6 hours, our AI analyzes multiple factors to calculate disease and pest risk for each field:
              </p>

              <div className="space-y-4">
                <div className="bg-sage-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-sage-800 mb-3">1. Weather Pattern Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-sage-700 mb-2">Current Conditions</h5>
                      <ul className="text-sm text-sage-600 space-y-1">
                        <li>• Temperature and humidity levels</li>
                        <li>• Rainfall frequency and amount</li>
                        <li>• Wind patterns and air circulation</li>
                        <li>• Dew point and leaf wetness duration</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-sage-700 mb-2">7-Day Forecast</h5>
                      <ul className="text-sm text-sage-600 space-y-1">
                        <li>• Optimal growth conditions for pathogens</li>
                        <li>• Extended wet periods favoring disease</li>
                        <li>• Temperature stress promoting pest activity</li>
                        <li>• Wind events spreading spores/insects</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-earth-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-earth-800 mb-3">2. Crop Growth Stage Assessment</h4>
                  <p className="text-earth-700 mb-2">
                    Different growth stages have different vulnerabilities:
                  </p>
                  <ul className="text-sm text-earth-600 space-y-1">
                    <li>• <strong>Seedling:</strong> High vulnerability to damping-off, cutworms</li>
                    <li>• <strong>Vegetative:</strong> Increased risk of aphids, leaf diseases</li>
                    <li>• <strong>Flowering:</strong> Critical period for head blight, thrips</li>
                    <li>• <strong>Grain fill:</strong> Risk of late-season diseases, armyworms</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-3">3. Historical Pattern Matching</h4>
                  <p className="text-green-700 mb-2">
                    Our database contains outbreak patterns for your region:
                  </p>
                  <ul className="text-sm text-green-600 space-y-1">
                    <li>• Typical timing of pest emergence in your area</li>
                    <li>• Weather conditions that preceded past outbreaks</li>
                    <li>• Regional disease pressure reports from extension services</li>
                    <li>• Your field's specific history of pest/disease issues</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-3">4. Satellite Health Monitoring</h4>
                  <p className="text-blue-700 mb-2">
                    Changes in satellite imagery can indicate early disease/pest pressure:
                  </p>
                  <ul className="text-sm text-blue-600 space-y-1">
                    <li>• Declining NDVI values in specific field areas</li>
                    <li>• Stress signatures before visible symptoms appear</li>
                    <li>• Spreading patterns consistent with disease/pest movement</li>
                    <li>• Comparison with neighboring fields and historical baselines</li>
                  </ul>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        {/* Risk Scoring System */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Understanding Risk Scores
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-6">
              <p className="text-sage-700">
                Each potential threat is scored from 0-100 based on multiple risk factors:
              </p>

              <div className="space-y-4">
                <div className="border-l-4 border-red-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <Badge className="bg-red-100 text-red-800">High Risk (70-100)</Badge>
                  </div>
                  <p className="text-sage-700 text-sm mb-2">
                    <strong>Action Required:</strong> Conditions are ideal for disease/pest development. 
                    Preventive treatments recommended within 24-48 hours.
                  </p>
                  <div className="text-sm text-red-600">
                    <p><strong>Example:</strong> "Fusarium head blight risk: 85/100. Warm, humid conditions during flowering stage."</p>
                  </div>
                </div>

                <div className="border-l-4 border-yellow-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <Badge className="bg-yellow-100 text-yellow-800">Moderate Risk (40-69)</Badge>
                  </div>
                  <p className="text-sage-700 text-sm mb-2">
                    <strong>Monitor Closely:</strong> Conditions are developing for potential problems. 
                    Increase scouting frequency and prepare for treatment if needed.
                  </p>
                  <div className="text-sm text-yellow-600">
                    <p><strong>Example:</strong> "Aphid pressure: 55/100. Temperature rising, beneficial insects present but declining."</p>
                  </div>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <Badge className="bg-green-100 text-green-800">Low Risk (0-39)</Badge>
                  </div>
                  <p className="text-sage-700 text-sm mb-2">
                    <strong>Normal Monitoring:</strong> Conditions are not favorable for disease/pest development. 
                    Continue regular scouting but no immediate action needed.
                  </p>
                  <div className="text-sm text-green-600">
                    <p><strong>Example:</strong> "Gray leaf spot: 25/100. Cool, dry conditions unfavorable for fungal development."</p>
                  </div>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        {/* Major Disease Categories */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Disease Categories We Monitor
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-sage-800 mb-3">Fungal Diseases</h4>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <ul className="text-sm text-orange-700 space-y-2">
                      <li>• <strong>Gray Leaf Spot:</strong> Warm, humid conditions</li>
                      <li>• <strong>Northern Corn Leaf Blight:</strong> Cool, wet weather</li>
                      <li>• <strong>Fusarium Head Blight:</strong> Flowering + rain</li>
                      <li>• <strong>Rust Diseases:</strong> Moderate temps + moisture</li>
                      <li>• <strong>Powdery Mildew:</strong> High humidity, poor air circulation</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sage-800 mb-3">Bacterial Diseases</h4>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <ul className="text-sm text-red-700 space-y-2">
                      <li>• <strong>Bacterial Leaf Streak:</strong> Warm, wet conditions</li>
                      <li>• <strong>Stewart's Wilt:</strong> Early season warmth</li>
                      <li>• <strong>Bacterial Stalk Rot:</strong> Late season stress</li>
                      <li>• <strong>Goss's Wilt:</strong> High temps + hail damage</li>
                      <li>• <strong>Fire Blight:</strong> Warm, humid springs</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sage-800 mb-3">Viral Diseases</h4>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <ul className="text-sm text-purple-700 space-y-2">
                      <li>• <strong>Maize Dwarf Mosaic:</strong> Vector-transmitted</li>
                      <li>• <strong>Wheat Streak Mosaic:</strong> Mite vectors</li>
                      <li>• <strong>Barley Yellow Dwarf:</strong> Aphid vectors</li>
                      <li>• <strong>Bean Pod Mottle:</strong> Beetle vectors</li>
                      <li>• <strong>Soybean Mosaic:</strong> Seed/aphid transmission</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sage-800 mb-3">Soil-Borne Diseases</h4>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <ul className="text-sm text-yellow-700 space-y-2">
                      <li>• <strong>Pythium Root Rot:</strong> Cool, wet soils</li>
                      <li>• <strong>Rhizoctonia:</strong> Warm, moist conditions</li>
                      <li>• <strong>Sclerotinia White Mold:</strong> Cool, wet canopy</li>
                      <li>• <strong>Charcoal Rot:</strong> Hot, dry stress</li>
                      <li>• <strong>Sudden Death Syndrome:</strong> Wet early season</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        {/* Pest Categories */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Pest Categories We Track
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-sage-800 mb-3">Chewing Insects</h4>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <ul className="text-sm text-green-700 space-y-2">
                      <li>• <strong>Corn Rootworm:</strong> Temperature-driven emergence</li>
                      <li>• <strong>European Corn Borer:</strong> Degree day accumulation</li>
                      <li>• <strong>Fall Armyworm:</strong> Migration patterns + heat</li>
                      <li>• <strong>Cutworms:</strong> Early season cool, wet conditions</li>
                      <li>• <strong>Japanese Beetle:</strong> Warm summer emergence</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sage-800 mb-3">Sucking Insects</h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <ul className="text-sm text-blue-700 space-y-2">
                      <li>• <strong>Aphids:</strong> Warm weather population explosions</li>
                      <li>• <strong>Spider Mites:</strong> Hot, dry conditions</li>
                      <li>• <strong>Thrips:</strong> Early season warm, dry spells</li>
                      <li>• <strong>Chinch Bugs:</strong> Hot weather stress periods</li>
                      <li>• <strong>Stink Bugs:</strong> Late season crop maturity</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sage-800 mb-3">Soil-Dwelling Pests</h4>
                  <div className="bg-earth-50 p-4 rounded-lg">
                    <ul className="text-sm text-earth-700 space-y-2">
                      <li>• <strong>Wireworms:</strong> Cool spring soil conditions</li>
                      <li>• <strong>White Grubs:</strong> Late summer egg laying</li>
                      <li>• <strong>Seed Corn Maggot:</strong> Cool, wet planting conditions</li>
                      <li>• <strong>Bean Leaf Beetle:</strong> Temperature-driven activity</li>
                      <li>• <strong>Billbugs:</strong> Early season warm periods</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sage-800 mb-3">Disease Vectors</h4>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <ul className="text-sm text-red-700 space-y-2">
                      <li>• <strong>Leafhoppers:</strong> Vector for aster yellows</li>
                      <li>• <strong>Whiteflies:</strong> Virus transmission risk</li>
                      <li>• <strong>Cucumber Beetles:</strong> Bacterial wilt vectors</li>
                      <li>• <strong>Wheat Curl Mites:</strong> Wheat streak mosaic</li>
                      <li>• <strong>Flea Beetles:</strong> Stewart's wilt transmission</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        {/* Weather Thresholds */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              Critical Weather Thresholds
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-6">
              <p className="text-sage-700 mb-4">
                Our AI uses research-based weather thresholds to trigger risk alerts:
              </p>

              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">High Disease Risk Conditions</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• <strong>Leaf Wetness:</strong> {'>'}10 hours with temps 60-80°F</li>
                    <li>• <strong>Humidity:</strong> {'>'}85% for 48+ hours</li>
                    <li>• <strong>Temperature:</strong> Consistent 70-85°F range</li>
                    <li>• <strong>Rainfall:</strong> {'>'}0.1" daily for 3+ consecutive days</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Pest Development Triggers</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• <strong>Growing Degree Days:</strong> Species-specific accumulations</li>
                    <li>• <strong>Temperature Ranges:</strong> Optimal development windows</li>
                    <li>• <strong>Drought Stress:</strong> Conditions favoring spider mites</li>
                    <li>• <strong>Wind Patterns:</strong> Migration and dispersal events</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Protective Conditions</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>Dry Periods:</strong> {'<'}40% humidity for 5+ days</li>
                    <li>• <strong>Temperature Extremes:</strong> {'<'}50°F or {'>'}95°F</li>
                    <li>• <strong>High Winds:</strong> {'>'}15 mph sustained speeds</li>
                    <li>• <strong>Beneficial Weather:</strong> Conditions favoring natural enemies</li>
                  </ul>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        {/* Action Recommendations */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              What to Do Based on Risk Levels
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-red-800 mb-2">High Risk (70-100): Immediate Action</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Apply preventive treatments within 24-48 hours</li>
                  <li>• Increase scouting to twice daily if possible</li>
                  <li>• Prepare spray equipment and check chemical inventory</li>
                  <li>• Consider adjusting irrigation to reduce leaf wetness</li>
                  <li>• Alert neighbors about potential regional outbreak</li>
                </ul>
              </div>
              
              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Moderate Risk (40-69): Prepare & Monitor</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Increase field scouting frequency to every 2-3 days</li>
                  <li>• Check treatment thresholds and have products ready</li>
                  <li>• Monitor weather forecasts for changing conditions</li>
                  <li>• Consider trap crops or beneficial insect releases</li>
                  <li>• Review and update spray schedules</li>
                </ul>
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-green-800 mb-2">Low Risk (0-39): Normal Operations</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Continue regular weekly scouting routine</li>
                  <li>• Focus on other field management priorities</li>
                  <li>• Maintain good crop nutrition and plant health</li>
                  <li>• Plan ahead for typical seasonal pest emergence</li>
                  <li>• Consider this a good time for equipment maintenance</li>
                </ul>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        {/* Final Tips */}
        <Alert>
          <Bug className="h-4 w-4" />
          <AlertDescription>
            <strong>Remember:</strong> Our risk assessments are predictions based on weather and historical data. 
            Always confirm with field scouting before making treatment decisions. The best disease and pest management 
            combines AI predictions with your eyes in the field and knowledge of local conditions.
          </AlertDescription>
        </Alert>
      </main>
    </DashboardLayout>
  )
}