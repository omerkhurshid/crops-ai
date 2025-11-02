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
  Activity,
  Info,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Calculator,
  Lightbulb,
} from "lucide-react";


export default function UnderstandingPlantHealthScoresPage() {

  return (
    <DashboardLayout>
      <main className="max-w-4xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-6 w-6 text-sage-700" />
            <span className="text-sage-600">Crop Health Monitoring</span>
          </div>

          <h1 className="text-3xl font-bold text-sage-800 mb-4">
            Understanding Plant Health Scores
          </h1>

          <div className="flex items-center gap-4 text-sm text-sage-600">
            <Badge variant="outline">8 min read</Badge>
            <span>•</span>
            <span>Last updated: January 2025</span>
          </div>
        </div>

        {/* Introduction */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardContent className="p-8">
            <p className="text-lg text-sage-700 leading-relaxed mb-4">
              At Cropple.ai, we use satellite technology to monitor your crops'
              health without you having to walk every field every day. Our
              system translates complex satellite data into simple health scores
              that any farmer can understand and act upon.
            </p>

            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <strong>Key Takeaway:</strong> Think of our health scores like a
                thermometer for your crops - a quick way to check if everything
                is normal or if some fields need your attention.
              </AlertDescription>
            </Alert>
          </ModernCardContent>
        </ModernCard>

        {/* How We Calculate Health Scores */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              How We Calculate Your Crop Health Score
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-sage-800 mb-2">
                  1. NDVI (Normalized Difference Vegetation Index)
                </h3>
                <p className="text-sage-700 mb-4">
                  This is our primary measurement. Healthy plants reflect
                  certain light wavelengths differently than stressed plants.
                  Our satellites detect these differences and convert them into
                  a score.
                </p>

                <div className="bg-sage-50 p-4 rounded-lg">
                  <p className="text-sm font-mono text-sage-700">
                    NDVI = (Near Infrared - Red Light) / (Near Infrared + Red
                    Light)
                  </p>
                  <p className="text-sm text-sage-600 mt-2">
                    Don't worry about the math - we handle it automatically!
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sage-800 mb-2">
                  2. Score Interpretation
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <Badge className="bg-green-100 text-green-800 mb-2">
                        80-100: Excellent Health
                      </Badge>
                      <p className="text-sage-700">
                        Your crops are thriving! Dense, green vegetation with
                        optimal growth.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <Badge className="bg-yellow-100 text-yellow-800 mb-2">
                        60-79: Good Health
                      </Badge>
                      <p className="text-sage-700">
                        Normal growth with some areas that could use attention.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <Badge className="bg-orange-100 text-orange-800 mb-2">
                        40-59: Moderate Stress
                      </Badge>
                      <p className="text-sage-700">
                        Your crops are showing signs of stress - investigate
                        soon.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <Badge className="bg-red-100 text-red-800 mb-2">
                        0-39: Severe Stress
                      </Badge>
                      <p className="text-sage-700">
                        Immediate attention needed - significant crop stress
                        detected.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sage-800 mb-2">
                  3. Factors We Consider
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-sage-400">•</span>
                    <span className="text-sage-700">
                      <strong>Growth Stage:</strong> Seedlings naturally have
                      lower scores than mature plants
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sage-400">•</span>
                    <span className="text-sage-700">
                      <strong>Crop Type:</strong> Corn typically shows higher
                      NDVI than wheat
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sage-400">•</span>
                    <span className="text-sage-700">
                      <strong>Season:</strong> We adjust expectations based on
                      planting date
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sage-400">•</span>
                    <span className="text-sage-700">
                      <strong>Historical Performance:</strong> We compare
                      against your field's typical patterns
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        {/* Understanding Trends */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Understanding Health Trends
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-4">
              <p className="text-sage-700">
                More important than a single score is how your crop health
                changes over time:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-800">
                      Improving Trend
                    </h4>
                  </div>
                  <p className="text-green-700 text-sm">
                    Health scores increasing week-over-week indicate your crops
                    are responding well to conditions or treatments.
                  </p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="h-5 w-5 text-red-600" />
                    <h4 className="font-semibold text-red-800">
                      Declining Trend
                    </h4>
                  </div>
                  <p className="text-red-700 text-sm">
                    Dropping scores may indicate stress from drought, pests,
                    disease, or nutrient deficiency.
                  </p>
                </div>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        {/* Common Causes of Score Changes */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Common Causes of Health Score Changes
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-sage-800 mb-3">
                  Why Scores Drop:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sage-700">
                      Environmental Stress
                    </h4>
                    <ul className="text-sm text-sage-600 space-y-1">
                      <li>• Drought or water stress</li>
                      <li>• Heat stress</li>
                      <li>• Frost damage</li>
                      <li>• Hail or wind damage</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sage-700">
                      Biological Issues
                    </h4>
                    <ul className="text-sm text-sage-600 space-y-1">
                      <li>• Disease outbreak</li>
                      <li>• Pest infestation</li>
                      <li>• Weed competition</li>
                      <li>• Nutrient deficiency</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-sage-800 mb-3">
                  Normal Score Variations:
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-sage-500 mt-0.5" />
                    <span className="text-sage-700">
                      <strong>Early Season:</strong> Lower scores are normal for
                      young plants
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-sage-500 mt-0.5" />
                    <span className="text-sage-700">
                      <strong>Late Season:</strong> Scores naturally decline as
                      crops mature and dry down
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-sage-500 mt-0.5" />
                    <span className="text-sage-700">
                      <strong>After Rain:</strong> Temporary score increases are
                      common after rainfall
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        {/* Action Guide */}
        <ModernCard variant="soft" className="mb-8">
          <ModernCardHeader>
            <ModernCardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              What to Do Based on Your Scores
            </ModernCardTitle>
          </ModernCardHeader>
          <ModernCardContent className="p-8">
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-sage-800 mb-2">
                  Score 80-100 (Excellent)
                </h4>
                <p className="text-sage-700">
                  Keep doing what you're doing! Monitor for any changes but no
                  immediate action needed.
                </p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <h4 className="font-semibold text-sage-800 mb-2">
                  Score 60-79 (Good)
                </h4>
                <p className="text-sage-700">
                  Schedule a field visit within the week. Look for early signs
                  of stress or uneven growth.
                </p>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold text-sage-800 mb-2">
                  Score 40-59 (Moderate Stress)
                </h4>
                <p className="text-sage-700">
                  Visit the field within 1-2 days. Check for pests, disease,
                  water stress, or nutrient issues.
                </p>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h4 className="font-semibold text-sage-800 mb-2">
                  Score 0-39 (Severe Stress)
                </h4>
                <p className="text-sage-700">
                  Immediate action required! Visit the field today to assess
                  damage and determine corrective measures.
                </p>
              </div>
            </div>
          </ModernCardContent>
        </ModernCard>

        {/* Tips */}
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            <strong>Pro Tip:</strong> Set up automatic alerts in your settings
            to get notified when any field drops below your chosen threshold.
            Most farmers set alerts for scores below 70.
          </AlertDescription>
        </Alert>
      </main>
    </DashboardLayout>
  );
}
