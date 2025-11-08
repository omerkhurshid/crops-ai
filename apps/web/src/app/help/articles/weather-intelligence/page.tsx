'use client'
import { DashboardLayout } from "../../../../components/layout/dashboard-layout";
import {
  ModernCard,
  ModernCardContent,
  ModernCardHeader,
  ModernCardTitle,
} from "../../../../components/ui/modern-card";
import { Badge } from "../../../../components/ui/badge";
import { Alert, AlertDescription } from "../../../../components/ui/alert";
import {
  CloudRain,
  Thermometer,
  Wind,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Droplets,
  Sun,
  Lightbulb,
} from "lucide-react";
export default function WeatherIntelligencePage() {
  return (
    <DashboardLayout>
      <main className="max-w-4xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <CloudRain className="h-6 w-6 text-sage-700" />
            <span className="text-sage-600">Weather Intelligence</span>
          </div>
          <h1 className="text-3xl font-bold text-sage-800 mb-4">
            Weather Data Integration & Smart Alerts
          </h1>
          <div className="flex items-center gap-4 text-sm text-sage-600">
            <Badge variant="outline">10 min read</Badge>
            <span>•</span>
            <span>Last updated: January 2025</span>
          </div>
        </div>
        {/* Introduction */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardContent className="p-8">
            <p className="text-lg text-sage-700 leading-relaxed mb-4">
              Crops.AI combines weather data from multiple sources to give you
              hyperlocal forecasts for each field, plus intelligent alerts that
              help you make better farming decisions before weather events
              impact your crops.
            </p>
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <strong>Key Benefit:</strong> Get field-specific weather
                insights that tell you not just what's coming, but exactly what
                you should do about it.
              </AlertDescription>
            </Alert>
          </ModernCardContent>
        </ModernCard>
        {/* Weather Data Sources */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              How We Get Hyperlocal Weather Data
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-6">
              <p className="text-sage-700">
                Your weather forecasts combine data from multiple sources for
                maximum accuracy:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-sage-800 mb-3">
                    Real-Time Sources
                  </h4>
                  <ul className="text-sm text-sage-700 space-y-2">
                    <li>
                      • <strong>Weather Stations:</strong> Local meteorological
                      data
                    </li>
                    <li>
                      • <strong>Radar Networks:</strong> Precipitation tracking
                    </li>
                    <li>
                      • <strong>Satellite Imagery:</strong> Cloud formation and
                      movement
                    </li>
                    <li>
                      • <strong>IoT Sensors:</strong> On-farm micro-climate
                      monitoring
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-sage-800 mb-3">
                    Forecast Models
                  </h4>
                  <ul className="text-sm text-sage-700 space-y-2">
                    <li>
                      • <strong>GFS Model:</strong> Global weather patterns
                    </li>
                    <li>
                      • <strong>NAM Model:</strong> Regional high-resolution
                      forecasts
                    </li>
                    <li>
                      • <strong>ECMWF:</strong> European medium-range
                      predictions
                    </li>
                    <li>
                      • <strong>AI Enhancement:</strong> Machine learning
                      refinements
                    </li>
                  </ul>
                </div>
              </div>
              <div className="bg-sage-50 p-6 rounded-lg">
                <h4 className="font-semibold text-sage-800 mb-3">
                  Precision by Field
                </h4>
                <p className="text-sage-700 text-sm">
                  Each of your fields gets its own forecast considering
                  elevation, slope, proximity to water bodies, and local
                  topography. A field in a valley may have different frost risk
                  than one on a hilltop.
                </p>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        {/* Key Weather Metrics */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Weather Metrics That Matter for Farming
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Droplets className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-sage-800">
                      Precipitation
                    </h4>
                  </div>
                  <ul className="text-sm text-sage-700 space-y-1">
                    <li>• Amount and intensity</li>
                    <li>• Rainfall probability</li>
                    <li>• Hail risk assessment</li>
                    <li>• Snow/ice conditions</li>
                  </ul>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Thermometer className="h-5 w-5 text-red-600" />
                    <h4 className="font-semibold text-sage-800">Temperature</h4>
                  </div>
                  <ul className="text-sm text-sage-700 space-y-1">
                    <li>• Daily high/low temperatures</li>
                    <li>• Growing degree days (GDD)</li>
                    <li>• Frost/freeze warnings</li>
                    <li>• Heat stress indicators</li>
                  </ul>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Wind className="h-5 w-5 text-gray-600" />
                    <h4 className="font-semibold text-sage-800">
                      Wind Conditions
                    </h4>
                  </div>
                  <ul className="text-sm text-sage-700 space-y-1">
                    <li>• Wind speed and direction</li>
                    <li>• Spray drift potential</li>
                    <li>• Crop lodging risk</li>
                    <li>• Evapotranspiration impact</li>
                  </ul>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-semibold text-sage-800">
                      Atmospheric Conditions
                    </h4>
                  </div>
                  <ul className="text-sm text-sage-700 space-y-1">
                    <li>• Humidity levels</li>
                    <li>• Atmospheric pressure</li>
                    <li>• Solar radiation</li>
                    <li>• Disease pressure risk</li>
                  </ul>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        {/* Smart Alert System */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Smart Weather Alerts & Actions
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-6">
              <p className="text-sage-700">
                Our AI doesn't just tell you the weather - it tells you what to
                do about it:
              </p>
              <div className="space-y-4">
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold text-red-800 mb-2">
                    Critical Alerts (Immediate Action)
                  </h4>
                  <div className="text-sm text-red-700 space-y-1">
                    <p>
                      • <strong>Frost Warning:</strong> "Frost expected tonight.
                      Cover sensitive crops or turn on irrigation."
                    </p>
                    <p>
                      • <strong>Severe Storm:</strong> "Hail possible in 4
                      hours. Secure equipment and postpone harvest."
                    </p>
                    <p>
                      • <strong>Spray Window:</strong> "Perfect spray conditions
                      for next 6 hours before wind picks up."
                    </p>
                  </div>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">
                    Planning Alerts (24-72 Hours)
                  </h4>
                  <div className="text-sm text-yellow-700 space-y-1">
                    <p>
                      • <strong>Rain Expected:</strong> "Heavy rain in 48 hours.
                      Skip irrigation and finish field work."
                    </p>
                    <p>
                      • <strong>Harvest Window:</strong> "3-day dry period
                      starting tomorrow. Ideal for harvest operations."
                    </p>
                    <p>
                      • <strong>Heat Wave:</strong> "Excessive heat forecast.
                      Monitor livestock and increase irrigation."
                    </p>
                  </div>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    Opportunity Alerts
                  </h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>
                      • <strong>Optimal Conditions:</strong> "Perfect
                      temperature and humidity for fungicide application."
                    </p>
                    <p>
                      • <strong>Disease Risk:</strong> "High humidity + warm
                      temps = disease pressure. Consider preventive spray."
                    </p>
                    <p>
                      • <strong>Growth Boost:</strong> "Ideal growing conditions
                      forecast. Crops may advance growth stage faster."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        {/* Weather-Based Recommendations */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              How Weather Affects Your Recommendations
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-6">
              <p className="text-sage-700 mb-4">
                Weather data is integrated into every recommendation our AI
                makes:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-sage-800 mb-3">
                    Irrigation Decisions
                  </h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Rainfall forecast reduces irrigation priority</li>
                      <li>• High temperatures increase water needs</li>
                      <li>• Wind speed affects application uniformity</li>
                      <li>• Humidity influences evapotranspiration rates</li>
                    </ul>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sage-800 mb-3">
                    Spray Applications
                  </h4>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Wind speed determines drift risk</li>
                      <li>• Temperature affects chemical efficacy</li>
                      <li>• Humidity influences absorption</li>
                      <li>• Rain forecast affects timing urgency</li>
                    </ul>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sage-800 mb-3">
                    Field Operations
                  </h4>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Soil moisture affects machinery access</li>
                      <li>• Temperature determines optimal work hours</li>
                      <li>• Weather windows guide operation timing</li>
                      <li>• Seasonal patterns inform planning</li>
                    </ul>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sage-800 mb-3">
                    Harvest Timing
                  </h4>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• Moisture content affects grain quality</li>
                      <li>• Weather windows prevent delays</li>
                      <li>• Storm warnings trigger urgent harvest</li>
                      <li>• Drying conditions optimize operations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        {/* Understanding Forecast Accuracy */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Understanding Forecast Accuracy
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-4">
              <p className="text-sage-700 mb-4">
                Different forecast timeframes have different accuracy levels:
              </p>
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <Badge className="bg-green-100 text-green-800">
                      0-24 Hours: 90-95% Accurate
                    </Badge>
                  </div>
                  <p className="text-sage-700 text-sm">
                    <strong>Very Reliable:</strong> Make critical decisions
                    based on these forecasts. Good for immediate spray decisions
                    and urgent operations.
                  </p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-yellow-600" />
                    <Badge className="bg-yellow-100 text-yellow-800">
                      1-3 Days: 80-85% Accurate
                    </Badge>
                  </div>
                  <p className="text-sage-700 text-sm">
                    <strong>Generally Reliable:</strong> Good for planning field
                    operations and scheduling work. Monitor for updates as time
                    approaches.
                  </p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <Badge className="bg-orange-100 text-orange-800">
                      4-7 Days: 70-75% Accurate
                    </Badge>
                  </div>
                  <p className="text-sage-700 text-sm">
                    <strong>Planning Guidance:</strong> Use for general planning
                    and resource allocation. Check daily for updates and
                    changes.
                  </p>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <Badge className="bg-red-100 text-red-800">
                      7+ Days: 60-65% Accurate
                    </Badge>
                  </div>
                  <p className="text-sage-700 text-sm">
                    <strong>Trend Awareness:</strong> Shows general weather
                    patterns but specifics may change. Use for strategic
                    planning only.
                  </p>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        {/* Customizing Weather Alerts */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle>Customizing Your Weather Alerts</ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-4">
              <p className="text-sage-700 mb-4">
                Tailor weather alerts to your specific crops and operations:
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-sage-400">1.</span>
                  <div>
                    <h4 className="font-semibold text-sage-800">
                      Set Temperature Thresholds
                    </h4>
                    <p className="text-sage-700 text-sm">
                      Define frost, heat stress, and optimal temperature ranges
                      for your specific crops.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-sage-400">2.</span>
                  <div>
                    <h4 className="font-semibold text-sage-800">
                      Configure Wind Limits
                    </h4>
                    <p className="text-sage-700 text-sm">
                      Set maximum wind speeds for spray applications and other
                      sensitive operations.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-sage-400">3.</span>
                  <div>
                    <h4 className="font-semibold text-sage-800">
                      Choose Alert Timing
                    </h4>
                    <p className="text-sage-700 text-sm">
                      Receive alerts 2-48 hours before events, depending on the
                      action needed.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-sage-400">4.</span>
                  <div>
                    <h4 className="font-semibold text-sage-800">
                      Field-Specific Settings
                    </h4>
                    <p className="text-sage-700 text-sm">
                      Different fields can have different alert thresholds based
                      on crop type and growth stage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>
        {/* Final Tips */}
        <Alert>
          <CloudRain className="h-4 w-4" />
          <AlertDescription>
            <strong>Pro Tip:</strong> Check weather forecasts every morning and
            evening during critical periods like planting, spraying, and
            harvest. Enable push notifications for critical alerts so you never
            miss time-sensitive weather warnings.
          </AlertDescription>
        </Alert>
      </main>
    </DashboardLayout>
  );
}
